import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { createAnonymousId } from '../services/api';

const ChatContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin
    : 'http://localhost:5000'
);

export const ChatProvider = ({ children }) => {
  const [tempUserId, setTempUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [matchState, setMatchState] = useState('idle'); // 'idle' | 'waiting' | 'chatting' | 'disconnected'
  
  const [roomId, setRoomId] = useState(null);
  const [partnerSocketId, setPartnerSocketId] = useState(null);
  const [partnerUserId, setPartnerUserId] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [strangerIsTyping, setStrangerIsTyping] = useState(false);

  const socketRef = useRef(null);

  // Initialize Temporary User ID
  useEffect(() => {
    const initUser = async () => {
      // Check sessionStorage first to persist session
      let storedId = sessionStorage.getItem('tempUserId');
      if (!storedId) {
        storedId = await createAnonymousId();
        sessionStorage.setItem('tempUserId', storedId);
      }
      setTempUserId(storedId);
    };
    initUser();
  }, []);

  // Set up socket connection
  useEffect(() => {
    if (!tempUserId) return;

    console.log('Connecting to Socket server...');
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Register user metadata with server once connected
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      socketInstance.emit('registerUser', { tempUserId });
    });

    // Socket Event: Match Found
    socketInstance.on('matchFound', (data) => {
      console.log('Match found event:', data);
      setRoomId(data.roomId);
      setPartnerSocketId(data.partnerSocketId);
      setPartnerUserId(data.partnerUserId);
      setIsInitiator(data.initiator);
      setMessages([]);
      setStrangerIsTyping(false);
      setMatchState('chatting');
      setError(null);
    });

    // Socket Event: Stranger Disconnected
    socketInstance.on('strangerDisconnected', (data) => {
      console.log('Stranger disconnected:', data);
      setMatchState('disconnected');
      setStrangerIsTyping(false);
      setRoomId(null);
      setPartnerSocketId(null);
      setPartnerUserId(null);
      setIsInitiator(false);
    });

    // Socket Event: Chat message received
    socketInstance.on('chatMessage', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          text: data.text,
          tempUserId: data.tempUserId,
          senderSocketId: data.senderSocketId,
          isMe: false,
          timestamp: data.timestamp || new Date(),
        },
      ]);
      setStrangerIsTyping(false);
    });

    // Socket Event: Typing Indicator
    socketInstance.on('typing', (data) => {
      setStrangerIsTyping(data.isTyping);
    });

    // Handle connection error
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Connection to server lost. Retrying...');
    });

    return () => {
      console.log('Disconnecting socket...');
      socketInstance.disconnect();
    };
  }, [tempUserId]);

  // Method to join matching queue
  const joinChatQueue = useCallback(() => {
    if (!socketRef.current || !tempUserId) return;
    setError(null);
    setMessages([]);
    setMatchState('waiting');
    console.log('Emitting joinQueue event...');
    socketRef.current.emit('joinQueue', { tempUserId });
  }, [tempUserId]);

  // Method to leave chat room and return to idle state
  const leaveChat = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('leaveRoom');
    setMatchState('idle');
    setRoomId(null);
    setPartnerSocketId(null);
    setPartnerUserId(null);
    setMessages([]);
    setStrangerIsTyping(false);
    setIsInitiator(false);
  }, []);

  // Method to skip current stranger and search for next
  const nextStranger = useCallback(() => {
    if (!socketRef.current || !tempUserId) return;
    console.log('Skipping stranger, searching for next...');
    socketRef.current.emit('leaveRoom');
    setMatchState('waiting');
    setMessages([]);
    setStrangerIsTyping(false);
    setRoomId(null);
    setPartnerSocketId(null);
    setPartnerUserId(null);
    setIsInitiator(false);
    socketRef.current.emit('joinQueue', { tempUserId });
  }, [tempUserId]);

  // Method to send chat message
  const sendMessage = useCallback((text) => {
    if (!socketRef.current || !roomId || !text.trim()) return;

    const messageData = {
      text,
      tempUserId,
    };

    socketRef.current.emit('chatMessage', messageData);

    setMessages((prev) => [
      ...prev,
      {
        text,
        tempUserId,
        senderSocketId: socketRef.current.id,
        isMe: true,
        timestamp: new Date(),
      },
    ]);
  }, [roomId, tempUserId]);

  // Send typing status to partner
  const sendTypingStatus = useCallback((isTyping) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('typing', { isTyping });
  }, [roomId]);

  return (
    <ChatContext.Provider
      value={{
        tempUserId,
        socket,
        matchState,
        roomId,
        partnerSocketId,
        partnerUserId,
        isInitiator,
        messages,
        error,
        strangerIsTyping,
        setError,
        joinChatQueue,
        leaveChat,
        nextStranger,
        sendMessage,
        sendTypingStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
