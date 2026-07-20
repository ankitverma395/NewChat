# StrangerChat: Random MERN Video & Text Chat Platform

A modern, high-performance, and feature-rich anonymous random matching video and text chat platform built using the MERN stack. Designed with a premium minimal interface, it features real-time peer-to-peer audio/video streaming, collaborative whiteboards, multiplayer mini-games, dynamic video filters, instant Google Translations, and synthesized audio effects.

---

## 🌟 Key Features

### 📡 Real-Time Matchmaking & Communication
- **No Signups Required:** Instantly start chatting with temporary, session-persisted anonymous user IDs.
- **WebRTC P2P Streaming:** Ultra-low latency video, audio, and screen sharing directly between peers using Google's public STUN servers.
- **Socket.io Signaling Server:** Dynamic signaling and high-speed matchmaking queue management.
- **Interest-Based Matching:** Enter custom tags (or tap popular suggestions) to match with users sharing your hobbies. Pairs randomly if no overlap is found within 5 seconds.
- **Auto Reconnect Queue:** Seamlessly return to the matchmaking queue 4 seconds after a partner leaves.

### 🎨 Visual & Interactive Extras
- **Dynamic Camera Filters:** Choose from 8 real-time CSS camera filters (*✨ No Filter, 📷 Black & White, 🍂 Sepia, 🎞️ Vintage, ❄️ Cool Blue, 🔥 Warm Golden, 🎨 Inverted, 🌫️ Blur Camera*).
- **Match Moments (Snapshot Engine):** Capture high-resolution JPEG snapshots of the chat screen, overlaying your mirrored camera preview with custom branding and timestamp watermarks.
- **Collaborative Doodle Board:** A real-time synchronized whiteboard tab allowing peers to draw together, adjust brush sizes/colors, and export doodles as PNG.
- **Multiplayer Tic-Tac-Toe:** Play a classic board game in real time with your partner, complete with turn sync, win/draw overlays, and instant replays.
- **"Would You Rather" Icebreaker:** Real-time synchronized card choice game with real-time reveal.
- **Floating Emoji Reactions:** Click-to-float animated emojis that drift and sway up the screen of both users simultaneously.

### 💬 Advanced Chat Utilities
- **Instant Translation Overlay:** Auto-translate incoming stranger messages in real time into multiple languages (*English, Spanish, French, German, Japanese, Hindi, Chinese*) using Google Translation API integration.
- **Text-to-Speech (TTS) Reader:** Read out incoming messages using standard browser speech synthesis.
- **Shared Soundboard Synthesizer:** Built-in retro synthesizers generating chime chords on match/message ticks, plus an interactive user soundboard to trigger funny retro audio effects (Laser Beam, Retro Coin, Power Up, Spring Jump, Game Over Chord) on the stranger's browser.
- **Dynamic Visual Themes:** Sync custom bubble colors (*Blue, Purple, Emerald, Rose, Amber*) with your match.
- **Chat Logs Exporter:** Download your conversation history as a formatted `.txt` file with local timestamps.

---

## 🛠️ Technical Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Socket.io-client, Simple WebRTC APIs
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB & Mongoose (Tracks active sessions, matching stats, and durations)

---

## 📂 Directory Structure

```text
proNew/
├── package.json               # Root scripts to install/build client and server concurrently
├── README.md                  # Detailed platform documentation and setup guides
├── server/                    # Node.js Express Signaling Server
│   ├── config/                # Database configurations (MongoDB connection setup)
│   ├── controllers/           # Session management controllers
│   ├── models/                # MongoDB Schema models (Active/Completed session logs)
│   ├── routes/                # Express API routes
│   ├── socket/                # Socket.io matchmaking, signaling, and game event handler
│   ├── utils/                 # Helper utilities (UUID generators)
│   ├── middlewares/           # Global error handler middleware
│   ├── .env                   # Server configurations (Ports, Database URI, Client URL)
│   └── server.js              # Server bootstrapper & static asset renderer
└── client/                    # React Vite Frontend Application
    ├── index.html             # Google fonts & HTML entry point
    ├── postcss.config.js      # PostCSS configurations
    ├── tailwind.config.js     # Tailwind design system tokens and colors
    └── src/
        ├── main.jsx           # App entry point
        ├── App.jsx            # Routing and matched layout pages rendering container
        ├── index.css          # Tailwind base directives and scrollbar styles
        ├── components/        # Reusable UI controls (Navbar, Footer, VideoPlayer, ChatBox, ControlBar, DoodleBoard, etc.)
        ├── pages/             # Layout pages (Home, WaitingScreen, ChatRoom)
        ├── hooks/             # Custom useWebRTC connection wrapper
        ├── context/           # ChatContext for centralized Socket.io and Tic-Tac-Toe state
        └── services/          # API services for session ID generation
```

---

## 🚀 Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v16+) and [MongoDB](https://www.mongodb.com/) installed and running locally on port `27017`.

### 1. Install Dependencies
Run the following script in the root directory to install packages for the root project, backend server, and frontend client:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create or verify `/server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stranger_chat
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run Locally
To run the server and client concurrently in development mode:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in two separate browser tabs (one in incognito) to test matchmaking and peer-to-peer video streaming.

---

## 🔧 WebRTC Troubleshooting & Safety

1. **Camera/Microphone Access:** WebRTC requires explicit browser media permission. Ensure camera and microphone access are granted in your address bar security settings.
2. **Local Loopback Limitations:** When testing locally on the same device, camera hardware conflicts may occur. Open an incognito tab or use secondary test cameras for authentic loopback results.
3. **Safety Guidelines:** Remind users to protect their privacy. Avoid sharing private links, locations, or files.

---

## 📦 Production Deployment

The project is preconfigured to serve the compiled frontend client directly from the backend server on a single port in production.

### Build and Package
To build the React client application and compile assets:
```bash
npm run build
```
This runs `npm run build` inside `/client` to generate the static files in `client/dist`, then configures the backend to serve them via `express.static()`.

### Deploy to Render
1. Connect your repository to [Render](https://render.com/).
2. Select **Web Service** with the following configurations:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Add environmental variables:
   - `NODE_ENV=production`
   - `MONGODB_URI` = *(Your MongoDB Atlas cluster URL)*
