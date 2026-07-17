# Simple Random Stranger Video Chat Website (MERN)

A modern, clean, and elegant Random Stranger Video Chat application similar to Omegle. It supports instant peer-to-peer video/audio connections, real-time chats, screen sharing, and automatic matchmaking queues using Socket.io and WebRTC.

## Features

- **No Signups/Logins**: Access instantly, generated session-based temporary anonymous user IDs.
- **WebRTC P2P connection**: Video, audio, and screen sharing are streamed directly between peers using Google's public STUN servers.
- **Socket.io Signaling**: Fast socket connection handles matchmaking queues and signaling.
- **Auto Reconnect**: If a user leaves, the active room closes and the remaining peer is automatically returned to the waiting queue after a 4-second notification delay.
- **Real-Time Text Chat**: Fully synchronized chat box with quick-tap and popup emoji panel, typing indicators, and auto-scroll.
- **Sleek Minimal Theme**: Built using a modern professional design system with soft borders, deep shadows, and clean whitespace using Tailwind CSS.
- **Responsive Layout**: Designed for seamless usability on desktop, tablet, and mobile screens.

---

## Technical Stack

- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios, Socket.io Client, WebRTC
- **Backend**: Node.js, Express.js, Socket.io, Mongoose
- **Database**: MongoDB (Tracks active matches and durations)

---

## Directory Structure

```text
proNew/
├── package.json               # Root scripts to install and run the project
├── README.md                  # Installation and usage instructions
├── server/                    # Node.js Express server
│   ├── .env                   # Configuration file (Ports, DB links, Client URL)
│   ├── server.js              # Server entry point
│   ├── config/                # Database configurations
│   ├── controllers/           # API endpoints controllers
│   ├── models/                # MongoDB Schema models
│   ├── routes/                # Express routes
│   ├── socket/                # Socket.io connection and matchmaking logic
│   └── middlewares/           # Global error handler middleware
└── client/                    # React Vite client
    ├── index.html             # Google fonts setup
    ├── tailwind.config.js     # Custom design systems colors and layouts
    └── src/
        ├── main.jsx           # App mounting point
        ├── App.jsx            # Matches route pages rendering container
        ├── index.css          # Tailwind base and scrollbar styles
        ├── components/        # Reusable view components (Navbar, Footer, Video displays, Control trays)
        ├── pages/             # Main application pages (Home, WaitingScreen, ChatRoom)
        ├── hooks/             # useWebRTC custom connection hook
        ├── context/           # ChatContext for socket actions
        └── services/          # Axios backend stats check
```

---

## Installation & Running

Follow these steps to run the application locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### Step 1: Install Dependencies

From the project root directory, run:
```bash
npm run install-all
```
*This installs root dev-runner packages and triggers `npm install` inside both `/client` and `/server` automatically.*

### Step 2: Configure Environment Variables

Create or adjust the configurations in `/server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stranger_chat
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: Run the Application

To run both backend server and frontend client concurrently:
```bash
npm run dev
```

If you prefer to start them in separate terminals:

**Start Server**:
```bash
cd server
npm start
```

**Start Client**:
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser. Open a second browser tab or incognito window to test matching and video chat locally!

---

## WebRTC Troubleshooting

1. **Camera/Mic Permissions**: Since WebRTC streams media, your browser will ask for device access. Click **Allow** when prompted. If blocked, check camera privacy settings in your browser address bar.
2. **Local Testing**: The project is preconfigured to use Google STUN servers. When testing on two local tabs, both camera feeds might share the same physical camera. For the best experience, test with another device or test webcam feeds independently.

---

## Deployment to GitHub & Render (Production)

This project is configured to run the client and server on a single port in production. The Express server serves the React production build automatically.

### Step 1: Push Code to GitHub

1. Initialize git in the root folder:
   ```bash
   git init
   ```
2. Add all files to staging (the `.gitignore` will automatically prevent secret files like `.env` and `node_modules` from being pushed):
   ```bash
   git add .
   ```
3. Commit the changes:
   ```bash
   git commit -m "Initial commit of Stranger Video Chat App"
   ```
4. Create a new repository on your GitHub account (do not add a README, gitignore, or license).
5. Link your local project to GitHub and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Render (or Heroku / Railway)

1. Sign up/Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `random-stranger-chat` (or any name you like)
   - **Environment**: `Node`
   - **Region**: Choose the closest region to your audience
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty - run from root)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://...` (Your MongoDB Atlas connection URI)
6. Click **Create Web Service**.

Render will automatically fetch the code, run the build command (which compiles React into the `client/dist` directory and installs server dependencies), and start the Express server. The app will be available on your Render URL!
