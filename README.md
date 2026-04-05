# 🏆 Nexus Events - Hackathon Built

## 💡 Find your vibe. Find your tribe.
Nexus is a modern, hyper-local event manager focused on **intimate micro-events** rather than massive concerts. Designed to combat post-pandemic disconnectedness, it helps people connect based on shared "vibes" and interests.

![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=flat&logo=html5&logoColor=white) 
![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=flat&logo=css3&logoColor=white) 
![JavaScript](https://img.shields.io/badge/JavaScript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)

## ✨ Killer Features
* **"Vibe" Matcher:** Real-time array filtering to immediately sort events based on mindset tags.
* **AR Holographic Tickets:** Unique CSS glassmorphism styling + Live API QR code generation for robust digital check-ins right from the user Dashboard.
* **Hype Meter:** Visual dynamic progress indicator showing how fast an event is booking up.
* **Interactive Maps:** Zero-dependency integration via Leaflet.js to pinpoint local events visually without API keys.
* **Zero Loading Screens:** Utilizing an engineered `localStorage` state-manager adapter (`store.js`), the app perfectly mimics a SPA (Single Page Application) state using entirely Vanilla Javascript.

## 🚀 How We Built It (Engineering Architecture)
We deliberately chose to use **Vanilla HTML/CSS/JS** instead of a heavy framework like React. Why?
1. **Raw Performance:** The application loads almost instantaneously.
2. **Deep DOM Mastery:** This proves deep engineering understanding of Web APIs, native `document` manipulation, `localStorage` frontend persistence, and the ECMAScript Module ecosystem.
3. **No Build Steps:** Instant deployment and iteration.

## 📥 Run Locally
1. Clone this repository.
2. Since it uses pure ES6 Modules (`type="module"`), you need a local development server to bypass immediate CORS issues. Do not just double click index.html.
3. Use VS Code **Live Server** extension, OR run Node `npx serve`:
   ```bash
   npx serve .
   ```
4. Open the localhost link in your browser!

## 🌍 Social Impact Angle
In an isolating digital world, "Nexus" encourages mental well-being by facilitating real, localized, low-pressure human connections. It is perfectly aligned with Hackathon **Social/Community Impact** bounds!
