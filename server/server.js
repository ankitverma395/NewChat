import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import sessionRoutes from './routes/sessionRoutes.js';
import socketHandler from './socket/socketHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB Database
connectDB();

// CORS Middleware Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io Setup with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
});

// Attach Socket Handlers
socketHandler(io);

// Mount API Routes
app.use('/api', sessionRoutes);

// Serve static assets in production or if client build exists
const clientDistPath = path.join(__dirname, '../client/dist');
const indexHtmlExists = fs.existsSync(path.join(clientDistPath, 'index.html'));

if (process.env.NODE_ENV === 'production' || indexHtmlExists) {
  console.log('Serving production client assets from:', clientDistPath);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API Route Not Found' });
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
} else {
  // Root path handler
  app.get('/', (req, res) => {
    res.json({ message: 'Stranger Chat Signaling Server API is running (Development Mode)' });
  });
}

// Error handling middleware
app.use(errorHandler);

// Start Server Listening
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
