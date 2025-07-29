# 🚀 ChatKiKiTi - Retro AI Chat App

Gemma Messenger is a modern, retro-inspired AI chat interface that evokes the nostalgia of the classic **Windows Live Messenger** experience, powered by cutting-edge technologies such as React, Express, and Generative AI (Gemma from HuggingFace).

---

## 🎯 Project Overview

Gemma Messenger provides a responsive, user-friendly chat experience that combines intuitive UI/UX with advanced AI integration:

* **Retro UI:** Inspired by Windows Live Messenger, featuring animated nudges, avatars, customizable nicknames, and status messages.
* **Multilingual Support:** Seamless switching between English and Spanish.
* **Voice Integration:** Browser-based speech recognition and text-to-speech for hands-free interaction.
* **AI-Powered Conversations:** Powered by HuggingFace Gemma, enabling advanced conversational capabilities with integrated "tool calls" (weather updates, Wikipedia, search functionality).

---

## 🛠️ Tech Stack & Key Features

### Frontend

* **React** (functional components, hooks)
* **Markdown Support** (`react-markdown`, `remark-gfm`)
* **Voice Recognition and Synthesis** (Browser Web Speech API)
* **Custom Styling & Animations** (CSS-in-JS)
* **Persistent Chat History** (LocalStorage)
* **Responsive and Mobile-Friendly** design with adaptive layouts

### Backend

* **Node.js / Express.js** (Proxy server for handling API calls)
* **HuggingFace Gemma** (Local Ollama instance)
* **Tool Integration** (Weather, Wikipedia, DuckDuckGo Search via APIs)
* **Dynamic System Prompts** for multilingual responses (English & Spanish)

### Development & Testing

* Local development via `localhost` and ngrok for cross-device testing
* Environment configuration for seamless dev/prod deployments

---

## 🚧 Challenges & Solutions

* **Cross-Device Compatibility:** Solved through adaptive API base URLs and dynamic environment configuration.
* **Responsive Design Issues:** Handled CSS overflow and animation quirks across desktop and mobile platforms.
* **Voice Integration Stability:** Implemented robust event-handling and browser compatibility checks.

---

## 🌟 Key Learnings & Expertise Highlight

* **Advanced React Architecture:** Custom hooks, state management, component modularization.
* **Generative AI Integration:** API handling, prompt engineering, JSON parsing, and tool calling.
* **Voice & Multimedia UX:** Implementation of Web Speech API, sound effect management, and animated interactions.
* **Multilingual & Localization Skills:** Dynamic UI content and system prompt customization for seamless language switching.
* **Problem-solving Mindset:** Debugging complex cross-device/network compatibility issues, enhancing frontend/backend communication reliability.

---

## ⚙️ Installation & Usage

Clone the repository:

```bash
git clone https://github.com/yourusername/gemma-messenger.git
cd gemma-messenger
```

Install dependencies:

```bash
npm install
```

Configure environment variables (`.env`):

```bash
REACT_APP_API_BASE_URL=http://your-api-base-url
```

Run Frontend & Backend:

```bash
npm start
```

---

## 📌 Future Improvements

* Enhanced multimedia capabilities (video sharing, GIFs)
* Cloud deployment (AWS, Azure, Vercel)
* Real-time chat via WebSockets

---

## 🤝 Connect with Me

I'm always excited about opportunities to build impactful projects involving modern web frameworks, generative AI, and cutting-edge UI/UX.

* **GitHub:** [santiagovittor](https://github.com/santiagovittor)
* **LinkedIn:** [Your Name](https://www.linkedin.com/in/santiago-vittor/)
* **Email:** [svittorev@gmail.com](mailto:svittordev@gmail.com)

---

### 🚨 Disclaimer

This project is created purely for learning, showcasing expertise, and demonstrating practical knowledge of emerging technologies.
