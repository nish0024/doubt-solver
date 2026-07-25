<div align="center">
  <img src="public/icon-512x512.png" alt="Doubt Solver Logo" width="120" />
  <h1>Doubt Solver (डब्ट सॉल्वर)</h1>
  <p><strong>A mobile-first, AI-powered homework assistant for Class 6 CBSE students.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  </p>
</div>

## 📖 Overview

**Doubt Solver** is a Progressive Web App (PWA) designed specifically for non-tech-savvy parents helping their children with CBSE Class 6 homework. 

Users simply take a photo of a math, science, or grammar problem. The app utilizes Google's **Gemini 2.5 Flash** vision model via a secure serverless backend to return a step-by-step explanation. Built with accessibility in mind, the interface is "Hindi-first" with large, legible typography and dynamic visual aids.

## ✨ Features

- **📸 Native Camera Integration:** Take photos directly within the app using the device's camera.
- **🧠 AI Vision Processing:** Sends images to a secure Vercel Serverless Function to keep API keys hidden.
- **🗣️ Progressive TTS (Text-to-Speech):** Reads answers aloud step-by-step. As each step is spoken, it highlights dynamically on the screen to guide the user's focus.
- **🎨 Animated Visual Aids:** Generates CSS/SVG animations (like fraction charts or math equations) synced with the spoken explanations.
- **📱 Installable PWA:** Behaves exactly like a native mobile app with offline App Shell caching, custom icons, and a standalone display mode.
- **🌐 Bilingual Support:** Instant toggle between simple spoken Hindi and English.
- **💾 Local History:** Saves recent doubts to `localStorage` for quick review without re-fetching data.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Vanilla CSS
- **Backend:** Node.js (Vercel Serverless Functions)
- **AI/ML:** Google Generative AI (`gemini-2.5-flash`)
- **PWA:** `vite-plugin-pwa`, Workbox

## 🚀 Getting Started

To run this project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nish0024/doubt-solver.git
   cd doubt-solver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server:**
   Because this project uses serverless functions, it is recommended to use the Vercel CLI for local development:
   ```bash
   npm run dev
   # OR for serverless support:
   vercel dev
   ```

5. **Open the app:**
   Navigate to `http://localhost:3000` (or the port provided by Vite/Vercel) in your browser.

## 📱 Screenshots

*(Add screenshots of the mobile UI, the active TTS highlighting, and the animated visual aids here!)*

---
<div align="center">
  Built with ❤️ by <a href="https://github.com/nish0024">Nishtha Lalwani</a>
</div>
