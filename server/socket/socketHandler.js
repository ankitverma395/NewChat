import { generateUUID } from '../utils/helpers.js';
import ChatSession from '../models/Session.js';
import { incrementActiveCount, decrementActiveCount } from '../controllers/sessionController.js';

// In-memory state tracking
const waitingQueue = []; // [{ socketId, tempUserId }]
const activeRooms = new Map(); // roomId -> { userA: { socketId, tempUserId }, userB: { socketId, tempUserId } }
const userToRoom = new Map(); // socketId -> roomId
const userMetadata = new Map(); // socketId -> tempUserId

export default function socketHandler(io) {
  io.on('connection', (socket) => {
    incrementActiveCount();
    console.log(`User connected: ${socket.id}. Total active: ${io.engine.clientsCount}`);

    // Register anonymous user metadata
    socket.on('registerUser', (data) => {
      const { tempUserId } = data;
      if (tempUserId) {
        userMetadata.set(socket.id, tempUserId);
      }
    });

    // Helper to clean up user room associations
    const handleLeaveRoom = async (socketId) => {
      const roomId = userToRoom.get(socketId);
      if (!roomId) return null;

      const room = activeRooms.get(roomId);
      if (room) {
        // Find partner
        const partner = room.userA.socketId === socketId ? room.userB : room.userA;
        const currentSender = room.userA.socketId === socketId ? room.userA : room.userB;

        console.log(`Removing user ${socketId} from room ${roomId}. Partner is ${partner.socketId}`);

        // Notify partner that stranger disconnected
        io.to(partner.socketId).emit('strangerDisconnected', {
          reason: 'Stranger left the chat',
        });

        // Make both leave the socket room
        const partnerSocket = io.sockets.sockets.get(partner.socketId);
        if (partnerSocket) {
          partnerSocket.leave(roomId);
        }
        socket.leave(roomId);

        // Remove room details from state
        activeRooms.delete(roomId);
        userToRoom.delete(partner.socketId);
        userToRoom.delete(socketId);

        // Complete session in MongoDB asynchronously
        try {
          const session = await ChatSession.findOne({ roomId, status: 'active' });
          if (session) {
            await session.completeSession();
          }
        } catch (dbErr) {
          console.error(`Error completing session: ${dbErr.message}`);
        }

        // Return the partner details so server can auto-re-queue them if needed
        return { partner, currentSender };
      }

      userToRoom.delete(socketId);
      return null;
    };

    // Helper to remove user from waiting queue
    const removeFromQueue = (socketId) => {
      const idx = waitingQueue.findIndex((u) => u.socketId === socketId);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
        console.log(`Removed ${socketId} from queue. Queue size: ${waitingQueue.length}`);
      }
    };

    // Socket Event: Join queue
    socket.on('joinQueue', async (data) => {
      const tempUserId = data.tempUserId || userMetadata.get(socket.id) || 'stranger_anon';
      userMetadata.set(socket.id, tempUserId);

      console.log(`User ${socket.id} (${tempUserId}) requested to join queue`);

      // 1. Ensure user is not in any room or in queue
      await handleLeaveRoom(socket.id);
      removeFromQueue(socket.id);

      // 2. Add to queue
      waitingQueue.push({ socketId: socket.id, tempUserId });
      console.log(`Added user ${socket.id} to queue. Queue size: ${waitingQueue.length}`);

      // 3. Try match
      if (waitingQueue.length >= 2) {
        const userA = waitingQueue.shift();
        const userB = waitingQueue.shift();

        // Extra check to verify sockets are still connected
        const socketA = io.sockets.sockets.get(userA.socketId);
        const socketB = io.sockets.sockets.get(userB.socketId);

        if (!socketA && socketB) {
          waitingQueue.unshift(userB);
          return;
        }
        if (!socketB && socketA) {
          waitingQueue.unshift(userA);
          return;
        }
        if (!socketA && !socketB) {
          return;
        }

        // Match found! Create Room
        const roomId = generateUUID();
        activeRooms.set(roomId, { userA, userB });
        userToRoom.set(userA.socketId, roomId);
        userToRoom.set(userB.socketId, roomId);

        socketA.join(roomId);
        socketB.join(roomId);

        console.log(`Match made! Room ID: ${roomId} between ${userA.socketId} and ${userB.socketId}`);

        // Write to DB asynchronously
        try {
          await ChatSession.create({
            roomId,
            userA: userA.tempUserId,
            userB: userB.tempUserId,
            status: 'active',
          });
        } catch (dbErr) {
          console.warn(`Failed to log chat session to DB: ${dbErr.message}`);
        }

        // Emit matchFound
        io.to(userA.socketId).emit('matchFound', {
          roomId,
          partnerSocketId: userB.socketId,
          partnerUserId: userB.tempUserId,
          initiator: true, // User A will initiate offer
        });

        io.to(userB.socketId).emit('matchFound', {
          roomId,
          partnerSocketId: userA.socketId,
          partnerUserId: userA.tempUserId,
          initiator: false, // User B will wait for offer
        });
      }
    });

    // Socket Event: WebRTC Signaling Offer
    socket.on('offer', (data) => {
      const { targetSocketId, offer } = data;
      console.log(`Signaling Offer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('offer', {
        senderSocketId: socket.id,
        offer,
      });
    });

    // Socket Event: WebRTC Signaling Answer
    socket.on('answer', (data) => {
      const { targetSocketId, answer } = data;
      console.log(`Signaling Answer from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('answer', {
        senderSocketId: socket.id,
        answer,
      });
    });

    // Socket Event: WebRTC ICE Candidate exchange
    socket.on('iceCandidate', (data) => {
      const { targetSocketId, candidate } = data;
      // console.log(`Signaling ICE candidate from ${socket.id} to ${targetSocketId}`);
      io.to(targetSocketId).emit('iceCandidate', {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Socket Event: Chat message
    socket.on('chatMessage', (data) => {
      const roomId = userToRoom.get(socket.id);
      if (roomId) {
        const { text, tempUserId } = data;
        console.log(`Chat message in room ${roomId} from ${socket.id}`);
        // Broadcast message to everyone in the room except sender (or use io.to to include sender)
        socket.to(roomId).emit('chatMessage', {
          text,
          tempUserId,
          senderSocketId: socket.id,
          timestamp: new Date(),
        });
      }
    });

    // Socket Event: Typing Indicator
    socket.on('typing', (data) => {
      const roomId = userToRoom.get(socket.id);
      if (roomId) {
        socket.to(roomId).emit('typing', {
          isTyping: data.isTyping,
          senderSocketId: socket.id,
        });
      }
    });

    // Socket Event: User clicks "Next" or leaves room
    socket.on('leaveRoom', async () => {
      console.log(`User ${socket.id} requested to leave room`);
      const cleanup = await handleLeaveRoom(socket.id);
      if (cleanup) {
        // Return partner and self back to queue if they want to reconnect
        // Wait: frontend will receive 'strangerDisconnected' and can auto-trigger joinQueue.
        // We also want to put the current user who clicked 'next' back in queue.
      }
    });

    // Socket Event: User disconnects
    socket.on('disconnect', async () => {
      decrementActiveCount();
      console.log(`User disconnected: ${socket.id}. Active users: ${io.engine.clientsCount}`);

      // 1. Remove from waiting queue if present
      removeFromQueue(socket.id);

      // 2. Handle room teardown
      await handleLeaveRoom(socket.id);

      // 3. Remove metadata
      userMetadata.delete(socket.id);
    });
  });
}
