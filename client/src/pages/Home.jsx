import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Sparkles, ShieldAlert, Check, MessageSquare, X, Play, Zap, 
  Gamepad2, PenTool, Globe, Camera, ChevronDown, ChevronUp, Users, 
  Lock, ShieldCheck, HelpCircle, ArrowUpRight, Activity, Volume2 
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { getServerStats } from '../services/api';

const SUGGESTED_INTERESTS = [
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Coding', emoji: '💻' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Movies', emoji: '🎬' },
  { label: 'Anime', emoji: '🍿' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Travel', emoji: '✈️' }
];

const FAQS = [
  {
    question: "Is StrangerChat completely anonymous?",
    answer: "Yes, absolutely. We do not require any registration, email address, or phone number. All user session IDs are randomly generated locally and persisted temporarily in your browser's session storage. We do not keep logs of your chat messages or video streams."
  },
  {
    question: "How does the matchmaking queue work?",
    answer: "When you enter interests tags, our matchmaking server looks for online users with matching or overlapping interests. If no exact interest overlap is found within 5 seconds, the algorithm automatically matches you with the next available stranger in your selected mode (Video or Text) so you're never left waiting."
  },
  {
    question: "Is WebRTC connection secure?",
    answer: "Yes. StrangerChat uses WebRTC (Web Real-Time Communication) to establish a direct Peer-to-Peer (P2P) connection between your browser and the stranger's browser. This means your video and audio data are streamed directly between peers and never pass through our backend servers, ensuring maximum privacy and ultra-low latency."
  },
  {
    question: "What are the multiplayer mini-games?",
    answer: "To break the ice, we offer a synchronized Tic-Tac-Toe game board and a 'Would You Rather' cards game directly inside the chat panel. You can play, reset, and see your partner's choices in real-time. We also offer a shared soundboard and whiteboard doodle tab."
  },
  {
    question: "How do I translate foreign messages?",
    answer: "Our built-in translation engine allows you to auto-translate incoming text messages into your preferred language (English, Spanish, French, German, Japanese, Hindi, Chinese) in real-time. Just select your target language from the chat box settings."
  }
];

export default function Home() {
  const { joinChatQueue, nickname, setNickname, dataSaverMode, setDataSaverMode } = useChat();
  const [selectedMode, setSelectedMode] = useState('video'); // 'video' | 'text'
  const [interestInput, setInterestInput] = useState('');
  const [interestList, setInterestList] = useState([]);
  const [stats, setStats] = useState({ activeUsers: 0, totalMatches: 0 });
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoTab, setDemoTab] = useState('video'); // 'video' | 'drawing' | 'game' | 'translation'

  // Tic-Tac-Toe Simulation State for interactive card
  const [simBoard, setSimBoard] = useState(Array(9).fill(null));
  const [simTurn, setSimTurn] = useState('X');

  // Translation Simulation State
  const [simChat, setSimChat] = useState([
    { sender: 'stranger', text: '¡Hola! ¿De dónde eres?', translation: 'Hello! Where are you from?', showTranslation: false },
    { sender: 'me', text: 'Hey! I\'m from California. Coding some React right now.', translation: '', showTranslation: false },
    { sender: 'stranger', text: '¡Qué bien! Me encanta la programación.', translation: 'How cool! I love programming.', showTranslation: false }
  ]);

  const joinBoxRef = useRef(null);

  // Fetch active user stats for landing display
  useEffect(() => {
    const fetchStats = async () => {
      const serverStats = await getServerStats();
      if (serverStats) {
        setStats({
          activeUsers: serverStats.activeUsers || 0,
          totalMatches: serverStats.totalSessionsMatches || 0
        });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 12000);
    return () => clearInterval(interval);
  }, []);

  // Tic-Tac-Toe Game Loop Simulation
  useEffect(() => {
    if (demoTab !== 'game') return;
    const sequence = [
      { idx: 4, symbol: 'X' },
      { idx: 0, symbol: 'O' },
      { idx: 8, symbol: 'X' },
      { idx: 2, symbol: 'O' },
      { idx: 6, symbol: 'X' }, // X wins diagonally (6-4-2 is not it, 4-8-0 is not it. Diagonals: 0-4-8, 2-4-6. Wait: 4, 8, 0, 2, 6 means X has 4, 8, 6. O has 0, 2. Let's make: 0, 4, 8 for X)
    ];

    // Let's program a clean winning sequence:
    // X at 0, O at 1
    // X at 4, O at 2
    // X at 8 (X wins diagonal)
    const moves = [
      { idx: 0, symbol: 'X' },
      { idx: 1, symbol: 'O' },
      { idx: 4, symbol: 'X' },
      { idx: 2, symbol: 'O' },
      { idx: 8, symbol: 'X' }
    ];

    let timer;
    let step = 0;

    const playNextStep = () => {
      if (step < moves.length) {
        setSimBoard(prev => {
          const next = [...prev];
          next[moves[step].idx] = moves[step].symbol;
          return next;
        });
        step++;
        timer = setTimeout(playNextStep, 1000);
      } else {
        // Reset board after win display
        timer = setTimeout(() => {
          setSimBoard(Array(9).fill(null));
          step = 0;
          playNextStep();
        }, 2000);
      }
    };

    setSimBoard(Array(9).fill(null));
    playNextStep();

    return () => clearTimeout(timer);
  }, [demoTab]);

  // Translation Simulation Timer Loop
  useEffect(() => {
    if (demoTab !== 'translation') return;
    
    let step = 0;
    let timer;

    const runTranslationCycle = () => {
      if (step === 0) {
        setSimChat(prev => [
          { ...prev[0], showTranslation: false },
          { ...prev[1], showTranslation: false },
          { ...prev[2], showTranslation: false }
        ]);
        timer = setTimeout(() => {
          setSimChat(prev => [
            { ...prev[0], showTranslation: true },
            prev[1],
            prev[2]
          ]);
          step = 1;
          runTranslationCycle();
        }, 1500);
      } else if (step === 1) {
        timer = setTimeout(() => {
          step = 2;
          runTranslationCycle();
        }, 2000);
      } else if (step === 2) {
        timer = setTimeout(() => {
          setSimChat(prev => [
            prev[0],
            prev[1],
            { ...prev[2], showTranslation: true }
          ]);
          step = 3;
          runTranslationCycle();
        }, 2000);
      } else {
        timer = setTimeout(() => {
          step = 0;
          runTranslationCycle();
        }, 4000);
      }
    };

    runTranslationCycle();
    return () => clearTimeout(timer);
  }, [demoTab]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInterest(interestInput);
    }
  };

  const addInterest = (text) => {
    const cleanText = text.trim().toLowerCase().replace(/,/g, '');
    if (cleanText && !interestList.includes(cleanText)) {
      setInterestList([...interestList, cleanText]);
    }
    setInterestInput('');
  };

  const removeInterest = (indexToRemove) => {
    setInterestList(interestList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleSuggestion = (tagLabel) => {
    const cleanTag = tagLabel.toLowerCase();
    if (interestList.includes(cleanTag)) {
      setInterestList(interestList.filter((t) => t !== cleanTag));
    } else {
      setInterestList([...interestList, cleanTag]);
    }
  };

  const handleStart = () => {
    joinChatQueue(selectedMode, interestList);
  };

  const scrollToJoin = () => {
    joinBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex-1 flex flex-col relative max-w-7xl mx-auto px-4 select-none overflow-x-hidden">
      
      {/* 1. HERO SECTION WITH SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-8 pb-16 md:py-24">
        
        {/* Left Column: Title & Metrics */}
        <div className="lg:col-span-6 flex flex-col text-left space-y-8 animate-fade-in">
          {/* Animated Glow Badge */}
          <div className="self-start inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-black px-4 py-2 rounded-full shadow-lg shadow-brand-500/5 hover:bg-brand-500/15 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Connect instantly with users worldwide</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-sans">
            Talk to Strangers,<br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              100% Anonymously.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
            StrangerChat connects you with peers around the world for video & text chats. No signups, no logging, zero installation. Step into a world of mini-games, instant translations, and creative doodle boards.
          </p>

          {/* Quick Metrics Dashboard */}
          <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/40 backdrop-blur-sm max-w-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-3xl font-extrabold text-white font-sans">
                  {stats.activeUsers > 0 ? stats.activeUsers + 12 : '48'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Users Online</span>
            </div>
            
            <div className="flex flex-col border-l border-slate-800/60 pl-6">
              <span className="text-3xl font-extrabold text-white font-sans">
                {stats.totalMatches > 0 ? stats.totalMatches : '1,240'}+
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Matches Made</span>
            </div>
          </div>

          {/* Headline Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-4 border-t border-slate-800/50">
            {[
              'Direct P2P WebRTC Streams',
              'Icebreaker Mini-Games',
              'Real-Time Doodle Blackboard',
              'Multi-language Translation'
            ].map((text, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-sm font-semibold text-slate-300">
                <div className="w-5 h-5 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-brand-400" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chat Join Settings Card */}
        <div ref={joinBoxRef} className="lg:col-span-6 flex justify-center w-full animate-slide-up">
          <div className="w-full max-w-lg bg-[#0d1424]/40 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)] text-center relative overflow-hidden">
            
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/10 blur-2xl rounded-full" />

            {/* Mode Selectors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setSelectedMode('video')}
                className={`flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 transition-all duration-300 font-bold text-sm ${
                  selectedMode === 'video'
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'border-slate-800 bg-slate-950/40 text-slate-450 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Video className={`w-5 h-5 ${selectedMode === 'video' ? 'text-brand-400' : ''}`} />
                <span>Video Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('text')}
                className={`flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 transition-all duration-300 font-bold text-sm ${
                  selectedMode === 'text'
                    ? 'border-brand-500 bg-brand-500/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'border-slate-800 bg-slate-950/40 text-slate-450 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <MessageSquare className={`w-5 h-5 ${selectedMode === 'text' ? 'text-brand-400' : ''}`} />
                <span>Text Chat</span>
              </button>
            </div>

            {/* Alias Input */}
            <div className="mb-5 text-left">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Nickname / Alias (Optional)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="E.g. CaptainCool, Anonymous..."
                maxLength={18}
                className="w-full bg-[#070b16]/80 border border-slate-800/85 hover:border-slate-700 text-white placeholder-slate-700 rounded-2xl px-4.5 py-3.5 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-[#070b16]/95 transition"
              />
            </div>

            {/* Interests Tag System */}
            <div className="mb-6 text-left">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Interests Tags (Optional)
              </label>
              <div className="bg-[#070b16]/80 border border-slate-800/85 hover:border-slate-700 rounded-2xl p-2.5 flex flex-wrap gap-1.5 items-center min-h-[58px] transition focus-within:border-brand-500 focus-within:bg-[#070b16]/95">
                {interestList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-lg"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(idx)}
                      className="p-0.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => addInterest(interestInput)}
                  placeholder={interestList.length === 0 ? "gaming, coding, anime..." : "Add..."}
                  className="flex-1 bg-transparent border-none text-sm font-medium text-white placeholder-slate-700 focus:outline-none min-w-[120px] px-1.5"
                />
              </div>

              {/* Suggestions */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SUGGESTED_INTERESTS.map((item) => {
                  const isSelected = interestList.includes(item.label.toLowerCase());
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleToggleSuggestion(item.label)}
                      className={`inline-flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full transition duration-150 border ${
                        isSelected
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-slate-900/40 hover:bg-slate-850/60 border-slate-800/80 text-slate-400 hover:text-slate-250'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data RAM Saver */}
            <div className="mb-6 text-left bg-slate-900/35 border border-slate-850/60 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>⚡</span> Data & RAM Saver Mode
                </span>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Lowers video stream qualities and reduces layout micro-animations. Recommended for mobile devices or slow networks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDataSaverMode(!dataSaverMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dataSaverMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    dataSaverMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Launch Action */}
            <button
              onClick={handleStart}
              className="group relative w-full py-4.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-base rounded-2xl transition-all duration-300 shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <span>{selectedMode === 'video' ? 'Start Video Chat' : 'Start Text Chat'}</span>
              <Play className="w-4.5 h-4.5 fill-white text-white transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL MATCHES NETWORK MAP VISUALIZER */}
      <div className="w-full py-12 mb-16 rounded-3xl bg-slate-950/20 border border-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        {/* Animated grid lines and background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Animated Connection Nodes */}
        <div className="absolute w-2.5 h-2.5 bg-brand-500 rounded-full animate-ping top-1/4 left-1/4" />
        <div className="absolute w-2 h-2 bg-indigo-500 rounded-full top-1/4 left-1/4" />
        
        <div className="absolute w-2.5 h-2.5 bg-fuchsia-500 rounded-full animate-ping top-1/2 right-1/4" />
        <div className="absolute w-2 h-2 bg-fuchsia-500 rounded-full top-1/2 right-1/4" />

        <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping bottom-1/4 left-1/3" />
        <div className="absolute w-2 h-2 bg-emerald-500 rounded-full bottom-1/4 left-1/3" />

        {/* Connection lines using absolute SVG overlays */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
          <path d="M 300,100 Q 500,150 700,200" fill="none" stroke="url(#gradient-blue)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
          <path d="M 700,200 Q 550,280 400,220" fill="none" stroke="url(#gradient-pink)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_8s_linear_infinite]" />
          <path d="M 400,220 Q 350,160 300,100" fill="none" stroke="url(#gradient-blue)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-[dash_12s_linear_infinite]" />
          
          <defs>
            <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative z-10 space-y-4 max-w-xl">
          <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/25 rounded-full text-brand-400 text-xs font-bold uppercase tracking-wider">
            Match Hub Live
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Live Global Network</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every second, users from America, Europe, Asia, and beyond connect securely over direct peer networks. Share ideas, doodle, play, and make friends without boundaries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2 bg-[#0c1221]/60 px-4 py-2 rounded-xl border border-slate-850">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-bold">Latency: ~40ms</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0c1221]/60 px-4 py-2 rounded-xl border border-slate-850">
              <Users className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-slate-300 font-bold">Matching Rate: Instant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE FEATURE DEMO SHOWCASE */}
      <div className="w-full py-8 mb-20">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-black text-white">Try the Interactive Features</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Take a look inside the chat room! Click on the tabs below to preview the tools you can use while matched with a stranger.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Tab Selection Column */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
            {[
              { id: 'video', title: 'Video Chat & Filters', desc: 'Choose from 8 real-time CSS camera filters to customize your screen.', icon: Camera, color: 'text-brand-400 bg-brand-500/10' },
              { id: 'drawing', title: 'Shared Blackboard', desc: 'Synchronized canvas to doodle with your stranger and download as PNG.', icon: PenTool, color: 'text-emerald-400 bg-emerald-500/10' },
              { id: 'game', title: 'In-Chat Games', desc: 'Engage with Tic-Tac-Toe directly integrated next to your chat box.', icon: Gamepad2, color: 'text-purple-400 bg-purple-500/10' },
              { id: 'translation', title: 'Instant Translation', desc: 'Read translations overlaying foreign stranger text in real-time.', icon: Globe, color: 'text-amber-400 bg-amber-500/10' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = demoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDemoTab(tab.id)}
                  className={`flex items-start text-left gap-4 p-4.5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                    isActive 
                      ? 'bg-slate-900/60 border-slate-800 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.3)]' 
                      : 'bg-transparent border-transparent hover:bg-slate-950/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tab.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold transition ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {tab.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="lg:col-span-8 bg-[#090d16]/80 border border-slate-850 rounded-3xl p-6 shadow-2xl relative flex flex-col min-h-[400px] justify-between overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

            {/* Chat simulation header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                Interface Preview Mode
              </span>
            </div>

            {/* Tab Render: Video */}
            {demoTab === 'video' && (
              <div className="grid grid-cols-2 gap-4 flex-1 items-center z-10">
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-center items-center shadow-lg group">
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-300 border border-slate-850">
                    You (Filter: Sepia)
                  </div>
                  {/* Sepia filter simulated on dummy user avatar container */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white filter sepia font-black text-xl shadow-lg">
                    C
                  </div>
                  <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>

                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-center items-center shadow-lg">
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-300 border border-slate-850">
                    Stranger (Filter: Cool Blue)
                  </div>
                  {/* Cool Blue filter simulated */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white hue-rotate-90 font-black text-xl shadow-lg">
                    S
                  </div>
                  <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            )}

            {/* Tab Render: Drawing */}
            {demoTab === 'drawing' && (
              <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
                <div className="w-full max-w-md aspect-[16/10] bg-[#070b16] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-inner relative overflow-hidden">
                  <div className="text-[10px] font-bold text-slate-600 absolute top-3 left-3">Neon Canvas</div>
                  
                  {/* Neon drawings */}
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    {/* Simulated hand-drawn heart path */}
                    <path
                      d="M 150,75 C 130,50 90,50 90,80 C 90,110 150,140 150,140 C 150,140 210,110 210,80 C 210,50 170,50 150,75 Z"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="500"
                      strokeDashoffset="500"
                      className="animate-[draw_4s_ease-in-out_infinite] shadow-[0_0_10px_#10b981]"
                    />
                    {/* Simulated user doodle text */}
                    <path 
                      d="M 60,30 L 70,30 L 70,40 M 80,30 L 90,40 M 90,30 L 80,40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-850/60 z-20">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] border border-white/20" />
                    <div className="w-5 h-5 rounded-full bg-brand-500" />
                    <div className="w-5 h-5 rounded-full bg-fuchsia-500" />
                    <span className="text-[10px] font-bold text-slate-500 ml-auto">Drawing synchronized...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Render: Game */}
            {demoTab === 'game' && (
              <div className="flex-1 flex items-center justify-center z-10">
                <div className="w-full max-w-[240px] aspect-square grid grid-cols-3 gap-2 bg-[#070b16] border border-slate-800 p-3 rounded-2xl shadow-lg">
                  {simBoard.map((cell, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl font-black transition-all"
                    >
                      {cell && (
                        <span className={cell === 'X' ? 'text-brand-400 animate-scale-up' : 'text-fuchsia-400 animate-scale-up'}>
                          {cell}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Render: Translation */}
            {demoTab === 'translation' && (
              <div className="flex-1 flex flex-col justify-end z-10 w-full max-w-lg mx-auto">
                <div className="space-y-4 w-full">
                  {simChat.map((msg, idx) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold max-w-[80%] ${
                          isMe 
                            ? 'bg-brand-500 text-white rounded-br-none shadow-md shadow-brand-500/10' 
                            : 'bg-slate-900/90 text-slate-200 border border-slate-850 rounded-bl-none'
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        {!isMe && msg.showTranslation && (
                          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 animate-fade-in shadow-inner-soft">
                            <Globe className="w-3 h-3 shrink-0" />
                            <span>Auto-Translated: {msg.translation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick demo note */}
            <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between text-[11px] text-slate-500 font-bold z-10">
              <span>Interactive sandbox preview</span>
              <button 
                onClick={scrollToJoin}
                className="text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline"
              >
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. HOW IT WORKS / TIMELINE */}
      <div className="w-full py-10 mb-20">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-black text-white">How StrangerChat Works</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Connecting anonymously has never been easier. Start matching in four quick steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {[
            { step: '01', title: 'Choose Mode & Tags', desc: 'Pick Video or Text mode and add custom interests (optional) to target specific matches.', icon: Zap, color: 'from-brand-500 to-indigo-500' },
            { step: '02', title: 'Immediate Match', desc: 'Our fast server pairs you in seconds with a stranger sharing your hobbies or randomly.', icon: Activity, color: 'from-indigo-500 to-purple-500' },
            { step: '03', title: 'Interact & Play', desc: 'Use real-time translators, sound synthesizers, draw together, or start Tic-Tac-Toe.', icon: Gamepad2, color: 'from-purple-500 to-fuchsia-500' },
            { step: '04', title: 'Skip Anytime', desc: 'If the conversation ends, click Next to auto-reconnect back to queue within 4 seconds.', icon: X, color: 'from-fuchsia-500 to-rose-500' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/20 border border-slate-850 p-6.5 rounded-3xl flex flex-col hover:border-brand-500/20 hover:bg-slate-900/30 transition-all duration-300 relative group">
              <div className={`absolute top-4 right-4 text-3xl font-black bg-gradient-to-br ${item.color} bg-clip-text text-transparent opacity-60 font-sans`}>
                {item.step}
              </div>
              <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-350 group-hover:scale-105 group-hover:text-white transition duration-300 mb-6">
                <item.icon className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PRIVACY & SAFETY CENTER */}
      <div className="w-full py-8 mb-20 bg-slate-950/15 border border-slate-900 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Trust Privacy</span>
          </div>
          <h2 className="text-3xl font-black text-white">Your Privacy is our Core Feature</h2>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            StrangerChat operates with direct Peer-to-Peer streaming using standard WebRTC parameters. We do not inspect, log, or record media streams or chat histories. No user profiles are created, and we do not tracking IP logs once disconnected.
          </p>
          <div className="space-y-4 pt-2">
            {[
              { title: 'No Account Required', desc: 'No email or phone fields. Jump straight into the action with temporary IDs.' },
              { title: 'WebRTC P2P Technology', desc: 'Video and audio pass directly between device hosts without hitting servers.' },
              { title: 'Local Session Cleanup', desc: 'All chat logs and settings are discarded automatically when you close the browser.' }
            ].map((safety, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{safety.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal font-semibold">{safety.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <div className="bg-[#0b1120]/80 border border-slate-850 p-6.5 rounded-2xl w-full max-w-md shadow-2xl relative">
            <div className="absolute top-4 right-4">
              <ShieldCheck className="w-8 h-8 text-brand-400 opacity-20" />
            </div>
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Safety & Ethics Guidelines
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-400 font-semibold list-disc list-inside">
              <li>Do not share passwords, pins, addresses, or emails.</li>
              <li>Report harassment or inappropriate behavior immediately.</li>
              <li>We support instant filters to hide or blur camera streams anytime.</li>
              <li>Toggle 'Data Saver' on old devices to prevent CPU overheating.</li>
              <li>You must be at least 18 years of age (or have parental permission).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 6. FAQ ACCORDION SECTION */}
      <div className="w-full py-8 mb-20 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <HelpCircle className="w-8 h-8 text-brand-400 mx-auto" />
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-slate-450 text-xs font-semibold">Have doubts? We have answers.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/25 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:bg-slate-900/40 transition-all focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 border-t border-slate-850/40 text-xs text-slate-450 leading-relaxed font-semibold animate-slide-down">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <div className="w-full py-16 mb-16 rounded-3xl bg-gradient-to-r from-brand-600/30 to-indigo-600/30 border border-brand-500/20 text-center relative overflow-hidden p-8 flex flex-col items-center justify-center space-y-6">
        <div className="absolute inset-0 bg-[#0c1221]/45 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-500/10 blur-3xl rounded-full" />
        
        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight font-sans">
          Ready to meet someone new?
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-semibold">
          Skip the setup, launch the matchmaker instantly, and experience modern video text chat.
        </p>

        <button
          onClick={scrollToJoin}
          className="px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm rounded-2xl shadow-lg shadow-white/5 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Start Matchmaking Now</span>
          <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
        </button>
      </div>

      {/* Safety warning floating block (original layout) */}
      <div className="mb-12 flex items-center gap-4 bg-amber-500/10 border border-amber-500/25 text-amber-350 rounded-2xl p-5 max-w-xl mx-auto text-xs font-semibold leading-relaxed">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
        <p>
          <strong>Anonymous Safety Warning:</strong> Never share sensitive credentials, locations, or account verification codes. StrangerChat does not record conversations or require registration.
        </p>
      </div>

      {/* Add custom CSS styles for simulated animations */}
      <style>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
}
