import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// --- 1. The Dynamic Particle Engine ---
class Particle {
  constructor(x, y, type, color, isCharging = false) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.color = color;
    this.opacity = 1;
    
    const angle = Math.random() * Math.PI * 2;
    const force = isCharging ? (Math.random() * 1.5 + 0.5) : (Math.random() * 7 + 4);
    
    this.speedX = Math.cos(angle) * force;
    this.speedY = Math.sin(angle) * force;
    
    this.size = type === 'rock' ? Math.random() * 8 + 4 : (isCharging ? 3 : Math.random() * 6 + 2);
  }

  update() {
    switch (this.type) {
      case 'fire':
        this.speedY -= 0.25;
        this.size *= 0.95;
        break;
      case 'water':
        this.speedY += 0.35;
        this.size *= 0.98;
        break;
      case 'electric':
        this.speedX += (Math.random() - 0.5) * 12;
        this.speedY += (Math.random() - 0.5) * 12;
        this.size = Math.random() * 8 + 1;
        break;
      case 'grass':
        this.speedY += Math.sin(this.x * 0.05) * 0.4;
        this.speedX += 0.4;
        break;
      case 'ghost':
        this.speedY -= 0.06;
        this.speedX += Math.sin(this.y * 0.02) * 1.8;
        this.size += 0.12;
        this.opacity -= 0.008;
        break;
      case 'psychic':
        this.speedX *= 0.93;
        this.speedY *= 0.93;
        this.size = Math.sin(performance.now() * 0.02) * 12 + 10;
        break;
      case 'rock':
        this.speedY += 0.6;
        break;
      case 'fairy':
        this.speedX *= 0.3;
        this.speedY *= 0.94;
        this.opacity -= 0.008;
        break;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.015;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    
    if (this.type === 'electric' || this.type === 'rock') {
      ctx.rect(this.x, this.y, this.size, this.size);
    } else {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    }
    
    ctx.fill();
    ctx.restore();
  }
}

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pokemonType, setPokemonType] = useState('fire');
  const particles = useRef([]);
  // Track pinching state globally in a ref so the screenshot tool can read it instantly
  const isCurrentlyPinching = useRef(false);
  const lastCoordinates = useRef({ x: 0, y: 0 });

  const typeConfig = {
    fire: { color: '#FF4500', label: '🔥 Fire' },
    water: { color: '#00BFFF', label: '💧 Water' },
    electric: { color: '#FFFF00', label: '⚡ Electric' },
    grass: { color: '#32CD32', label: '🌿 Grass' },
    ghost: { color: '#9370DB', label: '👻 Ghost' },
    psychic: { color: '#FF69B4', label: '🔮 Psychic' },
    fairy: { color: '#FFB6C1', label: '✨ Fairy' },
    rock: { color: '#8B4513', label: '🪨 Rock' }
  };

  useEffect(() => {
    let handLandmarker;
    let animationId;

    const setupApp = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      renderLoop();
    };

    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0) {
        animationId = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      const rect = video.getBoundingClientRect();
      
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      ctx.globalCompositeOperation = 'source-over';
      
      if (pokemonType === 'ghost' || pokemonType === 'psychic') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (video.readyState >= 2) {
        const results = handLandmarker.detectForVideo(video, performance.now());
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const thumbTip = landmarks[4];
          const indexFinger = landmarks[8];
          
          const px = (1 - indexFinger.x) * canvas.width;
          const py = indexFinger.y * canvas.height;
          
          lastCoordinates.current = { x: px, y: py };

          const distance = getDistance(thumbTip, indexFinger);
          // Increased threshold to 0.12 to make it easier to trigger across varying laptop webcams
          const isPinching = distance < 0.12; 
          isCurrentlyPinching.current = isPinching;

          if (isPinching) {
            // Add tight particles
            for (let i = 0; i < 6; i++) {
              particles.current.push(new Particle(px, py, pokemonType, typeConfig[pokemonType].color, true));
            }
          } else {
            const count = (pokemonType === 'ghost' || pokemonType === 'psychic') ? 30 : 20;
            for (let i = 0; i < count; i++) {
              particles.current.push(new Particle(px, py, pokemonType, typeConfig[pokemonType].color, false));
            }
          }
        } else {
          isCurrentlyPinching.current = false;
        }
      }

      // Render the particles using additive blending for glowing effect
      ctx.globalCompositeOperation = 'lighter';
      particles.current.forEach((p, index) => {
        p.update();
        p.draw(ctx);
        if (p.opacity <= 0) particles.current.splice(index, 1);
      });

      // Explicitly draw the solid orb overlay on top of particles so it doesn't get wiped or blended away
      if (isCurrentlyPinching.current) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over'; // Keeps it perfectly solid white
        ctx.beginPath();
        ctx.arc(lastCoordinates.current.x, lastCoordinates.current.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowBlur = 45;
        ctx.shadowColor = typeConfig[pokemonType].color;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    setupApp();

    return () => {
      cancelAnimationFrame(animationId);
      if (handLandmarker) handLandmarker.close();
    };
  }, [pokemonType]);

  // --- PERFECT COMPOSITE SCREENSHOT CAPTURE ---
  const captureScreenshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = canvas.width;
    mergedCanvas.height = canvas.height;
    const mCtx = mergedCanvas.getContext('2d');

    // 1. Draw mirrored background video stream track
    mCtx.save();
    mCtx.translate(mergedCanvas.width, 0);
    mCtx.scale(-1, 1);
    mCtx.drawImage(video, 0, 0, mergedCanvas.width, mergedCanvas.height);
    mCtx.restore();

    // 2. If Ghost/Psychic ambient dim themes are active, layer it on the capture canvas
    if (pokemonType === 'ghost' || pokemonType === 'psychic') {
      mCtx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
      mCtx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);
    }

    // 3. Enforce additive composite operations to accurately clone the active glow engine
    mCtx.globalCompositeOperation = 'lighter';
    mCtx.drawImage(canvas, 0, 0);

    // 4. Manually re-draw the solid core orb if screenshot happens during a pinch state
    if (isCurrentlyPinching.current) {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.beginPath();
      mCtx.arc(lastCoordinates.current.x, lastCoordinates.current.y, 18, 0, Math.PI * 2);
      mCtx.fillStyle = "white";
      mCtx.shadowBlur = 45;
      mCtx.shadowColor = typeConfig[pokemonType].color;
      mCtx.fill();
    }

    // 5. Fire instant download trigger
    const imageURL = mergedCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `pokemotion-${pokemonType}-${Date.now()}.png`;
    link.href = imageURL;
    link.click();
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center">
      <video 
        ref={videoRef} 
        className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ${
          (pokemonType === 'ghost' || pokemonType === 'psychic') ? 'brightness-50 grayscale contrast-125' : 'brightness-100'
        }`} 
        style={{ transform: 'scaleX(-1)' }} 
        playsInline 
      />

      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-20" 
      />

      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={captureScreenshot}
          className="bg-white text-black hover:bg-gray-100 font-bold py-2.5 px-5 rounded-xl shadow-2xl transition-all flex items-center gap-2 tracking-wide text-sm active:scale-95 border border-white/40"
        >
          📸 Capture Attack
        </button>
      </div>
      
      <div className="absolute bottom-8 grid grid-cols-2 md:grid-cols-4 gap-3 z-50 w-full max-w-2xl px-6">
        {Object.keys(typeConfig).map((type) => (
          <button 
            key={type}
            onClick={() => setPokemonType(type)}
            className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all shadow-lg backdrop-blur-md ${
              pokemonType === type 
              ? 'bg-white text-black scale-110 shadow-[0_0_20px_white]' 
              : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
            }`}
          >
            {typeConfig[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;