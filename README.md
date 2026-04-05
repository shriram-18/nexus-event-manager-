# 🏆 Nexus Event Manager

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/JavaScript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=flat&logo=html5&logoColor=white) 
![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=flat&logo=css3&logoColor=white) 

**Live Demo:** 🌍 [https://nexus-event-manager.onrender.com](https://nexus-event-manager.onrender.com)

## 💡 Find your vibe. Find your tribe.
Nexus is a modern, hyper-local event manager focused on **intimate micro-events** rather than massive concerts. Designed to combat post-pandemic disconnectedness, it helps people connect based on shared "vibes" and interests.

## ✨ Killer Features
* **Full-stack MERN Architecture:** Powered by an active Express.js + MongoDB backend with a robust REST API.
* **Role-Based Access Control:** Secure JWT authentication separating regular Users, Organizers, and Admins (`admin@nexus.com`), featuring an exclusive Admin Analytics Dashboard!
* **AI Event Descriptions:** Integration with **HuggingFace (Mixtral-8x7B)** to automatically generate creative event descriptions and tags for organizers based on event titles.
* **AR Holographic Tickets:** Unique CSS glassmorphism styling + Live API QR code generation for robust digital check-ins right from the user Dashboard.
* **Real-time Hype Meter:** Visual dynamic progress indicator mapping available tickets powered by Socket.io.
* **Interactive Maps:** Zero-dependency integration via Leaflet.js to pinpoint local events visually without API keys.
* **Dynamic Light/Dark Modes:** Full application-level theming, including responsive map tile swaps!

## 🚀 Engineering Architecture
The platform is engineered using the **MERN** philosophy but utilizes an ultra-fast **Vanilla ES6 Javascript** frontend that perfectly mimics a Single Page Application (SPA). This eliminates heavy framework overhead while maintaining deep State Management via a custom `store.js` adapter. 

The backend is built with **Node.js** and **Express**, featuring **Mongoose** for data modeling and **JWT (JSON Web Tokens)** for stateless authentication.

## 📥 Run Locally
1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=super_secret_key
   HF_TOKEN=your_huggingface_token
   ```
4. Start the server (this will run the backend and serve the frontend statically):
   ```bash
   npm start
   ```
5. Open `http://localhost:5000` in your browser!

## 🌍 Social Impact Angle
In an isolating digital world, "Nexus" encourages mental well-being by facilitating real, localized, low-pressure human connections. It is perfectly aligned with community/social impact hackathon parameters!
