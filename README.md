# ⚡ PokéMotion AR: Real-Time Gesture-Driven Elemental Simulator

> **Project Status:** 🚧 **Active Development (WIP)**  
> *Current Phase:  Web Audio API integration for spatial sound effects.*

**PokéMotion AR** is a high-performance Augmented Reality (AR) web application that translates human hand gestures into dynamic elemental animations. By merging **Computer Vision (AI)** with a custom-built **Particle Physics Engine**, the application allows users to "bend" elements like Fire, Electricity, and Water in real-time.

**THE LIVE LINK OF THE PROJECT WILL BE DISPLAYED WHEN THE PROJECT GETS COMPLETED AND GETS FULLY DEVELOPED.**
---

## 🚀 Technical Highlights

*   **Real-Time Landmark Detection:** Leverages **Google MediaPipe** to track 21 hand landmarks at 60 FPS, providing near-instantaneous response times.
*   **Mathematical Gesture Logic:** Implements **Euclidean Distance** algorithms to detect specific finger-tip proximities.
    *   *Feature:* **Pinch-to-Charge** — Detects proximity between Thumb (Point 4) and Index (Point 8) to trigger a localized energy-gathering state.
*   **Elemental Physics Engine:** A modular, class-based JavaScript system where each element possesses unique physical properties:
    *   **Gravity & Mass:** Water droplets follow parabolic trajectories.
    *   **Buoyancy:** Fire particles simulate heat-driven upward lift.
    *   **Non-Linear Motion:** Ghost/Psychic types utilize sine-wave oscillation to simulate "spooky" drift.
*   **Adaptive UI/UX:** Features a "Shadow Realm" transition—using dynamic CSS filters and Canvas overlays—that alters the camera feed's brightness and saturation based on the selected element.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js + Vite
*   **Vision AI:** `@mediapipe/tasks-vision`
*   **Graphics:** HTML5 Canvas API (with Additive Blending)
*   **Styling:** Tailwind CSS

---

## 🧠 Engineering Challenges & Solutions

### 1. The Mirror Coordinate Offset
**Problem:** MediaPipe returns normalized coordinates (0 to 1), which do not align naturally with a mirrored, CSS-scaled `object-cover` video feed.  
**Solution:** Calculated a dynamic mapping using `getBoundingClientRect()` to synchronize the Canvas pixel grid with the video's visible display area. Applied a horizontal flip transform `(1 - x)` to the landmarks to maintain intuitive user interaction.

### 2. Rendering Optimization
**Problem:** Drawing hundreds of particles while simultaneously processing a high-res video feed can lead to CPU throttling.  
**Solution:** Optimized the particle lifecycle by using a class-based "Pool" approach and `requestAnimationFrame`. Used `globalCompositeOperation: 'lighter'` to handle glowing effects efficiently without heavy shadow-blur overhead.

---

## 🗺️ Project Roadmap

- [x] **Phase 1:** Core Hand Landmark Integration.
- [x] **Phase 2:** Multi-Element Particle Classes.
- [x] **Phase 3:** Pinch Gesture Recognition & "Charge" states.
- [x] **Phase 4:** Environment Filters (Ghost/Psychic grayscale modes).
- [ ] **Phase 5:** **(Upcoming)** Web Audio API integration for spatial sound effects.
- [x] **Phase 6:** Capture Engine (Canvas-to-Image export).

---

## 🏃‍♂️ Installation & Local Setup

1.  **Clone the Repository:**
    
    git clone [https://github.com/Sonal-sp/pokemon-ar-sim.git](https://github.com/Sonal-sp/pokemon-ar-sim.git)

2. **Install Dependencies:**
npm install

3. **Run Development Server:**
npm run dev

4.  **Usage:** Grant camera permissions, select an element, and **pinch your index finger and thumb together** to charge your attack!

---

**Developed by:** [Sonal Shailesh Parmar]  
*Computer Engineering Student*
