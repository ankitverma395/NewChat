import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { createAnonymousId } from '../services/api';

const ChatContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin
    : 'http://localhost:5000'
);

const checkWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

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

  // New features state
  const [chatMode, setChatMode] = useState('video'); // 'video' | 'text'
  const [interests, setInterests] = useState([]);
  const [partnerInterests, setPartnerInterests] = useState([]);
  const [commonInterests, setCommonInterests] = useState([]);

  // Audio and Speech synthesis state
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem('soundsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const saved = localStorage.getItem('ttsEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const soundsEnabledRef = useRef(soundsEnabled);
  useEffect(() => {
    soundsEnabledRef.current = soundsEnabled;
    localStorage.setItem('soundsEnabled', JSON.stringify(soundsEnabled));
  }, [soundsEnabled]);

  const ttsEnabledRef = useRef(ttsEnabled);
  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
    localStorage.setItem('ttsEnabled', JSON.stringify(ttsEnabled));
  }, [ttsEnabled]);

  const playSound = useCallback((type) => {
    if (!soundsEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      if (type === 'match') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'message') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'leave') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.4);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }, []);

  // Nickname settings
  const [nickname, setNickname] = useState(() => localStorage.getItem('userNickname') || '');
  const [partnerNickname, setPartnerNickname] = useState('Stranger');

  useEffect(() => {
    localStorage.setItem('userNickname', nickname);
  }, [nickname]);

  // Tic-Tac-Toe states
  const [board, setBoard] = useState(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'invited' | 'receiving_invite' | 'playing' | 'won' | 'lost' | 'draw'
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Chat themes state
  const [myTheme, setMyTheme] = useState('blue'); // 'blue' | 'purple' | 'emerald' | 'rose' | 'amber'
  const [partnerTheme, setPartnerTheme] = useState('blue');

  const isInitiatorRef = useRef(false);
  useEffect(() => {
    isInitiatorRef.current = isInitiator;
  }, [isInitiator]);

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
      setPartnerInterests(data.interests || []);
      setCommonInterests(data.commonInterests || []);
      setMyTheme('blue');
      setPartnerTheme('blue');
      setPartnerNickname(data.partnerNickname || 'Stranger');
      if (data.chatMode) {
        setChatMode(data.chatMode);
      }
      playSound('match');
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
      setPartnerInterests([]);
      setCommonInterests([]);
      setBoard(Array(9).fill(null));
      setGameStatus('idle');
      setIsMyTurn(false);
      setMyTheme('blue');
      setPartnerTheme('blue');
      setPartnerNickname('Stranger');
      playSound('leave');
    });

    // Socket Event: Theme Changed
    socketInstance.on('themeChange', (data) => {
      console.log('Received partner theme change:', data.theme);
      setPartnerTheme(data.theme);
    });

    // Socket Event: Tic-Tac-Toe Game Action
    socketInstance.on('gameAction', (data) => {
      console.log('Received gameAction event:', data);
      if (data.type === 'invite') {
        setGameStatus('receiving_invite');
      } else if (data.type === 'accept') {
        setBoard(Array(9).fill(null));
        setGameStatus('playing');
        setIsMyTurn(isInitiatorRef.current);
      } else if (data.type === 'decline') {
        setGameStatus('idle');
      } else if (data.type === 'move') {
        const symbol = isInitiatorRef.current ? 'O' : 'X';
        setBoard((prev) => {
          const nextBoard = [...prev];
          nextBoard[data.cellIndex] = symbol;
          
          const winner = checkWinner(nextBoard);
          if (winner === symbol) {
            setGameStatus('lost');
          } else if (nextBoard.every((cell) => cell !== null)) {
            setGameStatus('draw');
          } else {
            setIsMyTurn(true);
          }
          return nextBoard;
        });
      } else if (data.type === 'reset') {
        setBoard(Array(9).fill(null));
        setGameStatus('playing');
        setIsMyTurn(isInitiatorRef.current);
      }
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
      playSound('message');

      // Speak message if TTS reader is enabled
      if (ttsEnabledRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.text);
          window.speechSynthesis.speak(utterance);
        } catch (speechErr) {
          console.warn('Speech synthesis error:', speechErr);
        }
      }
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
  const joinChatQueue = useCallback((selectedMode, selectedInterests) => {
    if (!socketRef.current || !tempUserId) return;
    setError(null);
    setMessages([]);
    setMatchState('waiting');

    const mode = selectedMode || chatMode;
    const currentInterests = selectedInterests || interests;

    if (selectedMode) setChatMode(selectedMode);
    if (selectedInterests) setInterests(selectedInterests);

    console.log('Emitting joinQueue event...', { tempUserId, chatMode: mode, interests: currentInterests, nickname });
    socketRef.current.emit('joinQueue', { tempUserId, chatMode: mode, interests: currentInterests, nickname });
  }, [tempUserId, chatMode, interests, nickname]);

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
    setPartnerInterests([]);
    setCommonInterests([]);
    setBoard(Array(9).fill(null));
    setGameStatus('idle');
    setIsMyTurn(false);
    setMyTheme('blue');
    setPartnerTheme('blue');
    setPartnerNickname('Stranger');
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
    setPartnerInterests([]);
    setCommonInterests([]);
    setBoard(Array(9).fill(null));
    setGameStatus('idle');
    setIsMyTurn(false);
    setMyTheme('blue');
    setPartnerTheme('blue');
    setPartnerNickname('Stranger');
    socketRef.current.emit('joinQueue', { tempUserId, chatMode, interests, nickname });
  }, [tempUserId, chatMode, interests, nickname]);

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

  // Tic-Tac-Toe Actions
  const sendGameInvite = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    setGameStatus('invited');
    socketRef.current.emit('gameAction', { type: 'invite' });
  }, [roomId]);

  const acceptGameInvite = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    setBoard(Array(9).fill(null));
    setGameStatus('playing');
    setIsMyTurn(isInitiator); // Player X (the initiator) goes first, so my turn is true only if I am the initiator
    socketRef.current.emit('gameAction', { type: 'accept' });
  }, [roomId, isInitiator]);

  const declineGameInvite = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    setGameStatus('idle');
    socketRef.current.emit('gameAction', { type: 'decline' });
  }, [roomId]);

  const makeGameMove = useCallback((cellIndex) => {
    if (!socketRef.current || !roomId || !isMyTurn || board[cellIndex] !== null) return;
    const mySymbol = isInitiator ? 'X' : 'O';
    
    setBoard((prev) => {
      const nextBoard = [...prev];
      nextBoard[cellIndex] = mySymbol;
      
      const winner = checkWinner(nextBoard);
      if (winner === mySymbol) {
        setGameStatus('won');
      } else if (nextBoard.every((cell) => cell !== null)) {
        setGameStatus('draw');
      } else {
        setIsMyTurn(false);
      }
      
      socketRef.current.emit('gameAction', { type: 'move', cellIndex });
      return nextBoard;
    });
  }, [roomId, isMyTurn, board, isInitiator]);

  const resetGame = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    setBoard(Array(9).fill(null));
    setGameStatus('playing');
    setIsMyTurn(isInitiator);
    socketRef.current.emit('gameAction', { type: 'reset' });
  }, [roomId, isInitiator]);

  const changeTheme = useCallback((newTheme) => {
    setMyTheme(newTheme);
    if (socketRef.current && roomId) {
      socketRef.current.emit('themeChange', { theme: newTheme });
    }
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
        chatMode,
        setChatMode,
        interests,
        setInterests,
        partnerInterests,
        commonInterests,
        // Game states & handlers
        board,
        gameStatus,
        isMyTurn,
        sendGameInvite,
        acceptGameInvite,
        declineGameInvite,
        makeGameMove,
        resetGame,
        // Theme states & triggers
        myTheme,
        partnerTheme,
        changeTheme,
        // Nickname state
        nickname,
        setNickname,
        partnerNickname,
        // Sound and TTS settings
        soundsEnabled,
        setSoundsEnabled,
        ttsEnabled,
        setTtsEnabled,
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
