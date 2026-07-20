import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Download, Sparkles, Volume2, VolumeX, Globe, ChevronDown, Zap, MessageSquare, Gamepad2, Palette } from 'lucide-react';
import MessageBubble from './MessageBubble';
import DoodleBoard from './DoodleBoard';
import { useChat } from '../context/ChatContext';

const QUICK_EMOJIS = ['👋', '😊', '😂', '😮', '👍', '❤️'];

const WOULD_YOU_RATHER_QUESTIONS = [
  { optionA: "Always speak your mind", optionB: "Never speak again" },
  { optionA: "Be able to fly at 10 mph", optionB: "Be able to run at 100 mph" },
  { optionA: "Live without music", optionB: "Live without movies" },
  { optionA: "Travel 100 years to the past", optionB: "Travel 100 years to the future" },
  { optionA: "Be the funniest person alive", optionB: "Be the smartest person alive" },
  { optionA: "Only eat your favorite food forever", optionB: "Never eat your favorite food again" },
  { optionA: "Be invisible for 1 hour a day", optionB: "Be able to read minds for 10 mins a day" },
  { optionA: "Always be 15 minutes late", optionB: "Always be 25 minutes early" },
  { optionA: "Have unlimited free travel", optionB: "Have unlimited free food" },
  { optionA: "Live in a luxury cave", optionB: "Live in a high-tech treehouse" }
];

const THEME_DOTS = [
  { name: 'blue', color: 'bg-brand-500 hover:scale-110 active:scale-95' },
  { name: 'purple', color: 'bg-indigo-500 hover:scale-110 active:scale-95' },
  { name: 'emerald', color: 'bg-emerald-500 hover:scale-110 active:scale-95' },
  { name: 'rose', color: 'bg-rose-500 hover:scale-110 active:scale-95' },
  { name: 'amber', color: 'bg-amber-500 hover:scale-110 active:scale-95' },
];

const ICEBREAKERS = [
  "If you could have any superpower, what would it be?",
  "What is the best movie you have ever watched?",
  "What's your absolute go-to comfort food?",
  "Would you rather travel 100 years into the past or the future?",
  "What's the weirdest food combination you secretly enjoy?",
  "If you won a million dollars today, what's the first thing you'd buy?",
  "What is your favorite hobby or way to pass the time?",
  "If you could live anywhere in the world, where would it be?",
  "What's the most adventurous thing you've ever done?",
  "Are you a cat person or a dog person?",
];

export default function ChatBox({ messages, onSendMessage, onSendTypingStatus, strangerIsTyping }) {
  const [inputText, setInputText] = useState('');
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'game' | 'doodle'
  const [translationLang, setTranslationLang] = useState('none');
  const [translatedMessages, setTranslatedMessages] = useState({});
  const translatedKeysRef = useRef(new Set());

  // Reset translations when changing target language
  useEffect(() => {
    setTranslatedMessages({});
    translatedKeysRef.current.clear();
  }, [translationLang]);

  // Translate incoming messages in real-time
  useEffect(() => {
    if (translationLang === 'none') return;

    const translateNewMessages = async () => {
      const updates = {};
      let changed = false;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.isMe) continue;

        const key = `${msg.timestamp}_${msg.text}`;
        if (!translatedKeysRef.current.has(key)) {
          translatedKeysRef.current.add(key);
          try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${translationLang}&dt=t&q=${encodeURIComponent(msg.text)}`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            if (data && data[0] && data[0][0] && data[0][0][0]) {
              updates[key] = data[0][0][0];
              changed = true;
            }
          } catch (err) {
            console.error('Translation error:', err);
            translatedKeysRef.current.delete(key);
          }
        }
      }

      if (changed) {
        setTranslatedMessages((prev) => ({ ...prev, ...updates }));
      }
    };

    translateNewMessages();
  }, [messages, translationLang]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Load Tic-Tac-Toe states and actions from context
  const {
    board,
    gameStatus,
    isMyTurn,
    sendGameInvite,
    acceptGameInvite,
    declineGameInvite,
    makeGameMove,
    resetGame,
    isInitiator,
    myTheme,
    partnerTheme,
    changeTheme,
    partnerNickname,
    soundsEnabled,
    setSoundsEnabled,
    ttsEnabled,
    setTtsEnabled,
    dataSaverMode,
    setDataSaverMode,
    triggerReaction,
    activeGameTab,
    changeGameTab,
    wyrIndex,
    myWyrVote,
    partnerWyrVote,
    voteWyr,
    nextWyrQuestion,
    playSfxShared,
  } = useChat();

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const chatLog = messages
      .map((msg) => {
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sender = msg.isMe ? 'You' : partnerNickname;
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join('\n');

    const blob = new Blob([chatLog], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stranger_chat_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Auto-scroll to bottom of messages list
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, strangerIsTyping, activeTab]);

  // Handle typing status notification
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onSendTypingStatus(true);
    }

    // Reset typing status timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onSendTypingStatus(false);
    }, 2000);
  };

  // Submit/Send message
  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    onSendTypingStatus(false);
  };

  // Append emoji to text input
  const handleAddEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiGrid(false);
  };

  const handleGetIcebreaker = () => {
    const randomQuestion = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    setInputText(randomQuestion);
    onSendTypingStatus(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onSendTypingStatus(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1424]/40 border border-slate-800/80 text-white rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/20 select-none">
        <h3 className="text-xs font-black text-white leading-tight uppercase tracking-wider font-sans">
          Room<br/>Chat
        </h3>
        <div className="flex items-center space-x-2">
          {/* Real-time Translator Dropdown */}
          {activeTab === 'chat' && (
            <div className="relative flex items-center bg-[#0b0f19]/80 border border-slate-800/85 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-slate-850 hover:text-white transition cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-blue-400 mr-1.5 shrink-0" />
              <select
                value={translationLang}
                onChange={(e) => setTranslationLang(e.target.value)}
                className="bg-transparent outline-none cursor-pointer appearance-none pr-4 text-white font-extrabold text-[10px]"
              >
                <option value="none" className="bg-slate-950 text-white">Off</option>
                <option value="en" className="bg-slate-950 text-white">EN</option>
                <option value="es" className="bg-slate-950 text-white">ES</option>
                <option value="fr" className="bg-slate-950 text-white">FR</option>
                <option value="de" className="bg-slate-950 text-white">DE</option>
                <option value="ja" className="bg-slate-950 text-white">JA</option>
                <option value="hi" className="bg-slate-950 text-white">HI</option>
                <option value="zh" className="bg-slate-950 text-white">ZH</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-450 absolute right-1.5 pointer-events-none" />
            </div>
          )}

          {/* Sound FX Toggle Button */}
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setSoundsEnabled(!soundsEnabled)}
              title={soundsEnabled ? "Mute Sound Effects" : "Unmute Sound Effects"}
              className={`p-2 rounded-xl border transition ${
                soundsEnabled 
                  ? 'bg-[#0b0f19]/80 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-850' 
                  : 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {soundsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Data & RAM Saver Mode Toggle Button */}
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setDataSaverMode(!dataSaverMode)}
              title={dataSaverMode ? "Disable Data & RAM Saver Mode" : "Enable Data & RAM Saver"}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                dataSaverMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/35 shadow-sm' 
                  : 'bg-[#0b0f19]/80 border-slate-800 text-slate-450 hover:text-slate-350 hover:bg-slate-850'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span className="hidden sm:inline">Saver</span>
            </button>
          )}

          {/* TTS Read Aloud Toggle Button */}
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? "Disable Text-to-Speech (TTS)" : "Enable Text-to-Speech (TTS)"}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                ttsEnabled 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/35 shadow-sm' 
                  : 'bg-[#0b0f19]/80 border-slate-800 text-slate-450 hover:text-slate-350 hover:bg-slate-850'
              }`}
            >
              <MessageSquare className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">TTS</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportChat}
              title="Save Chat Log"
              className="p-2 border border-slate-800 bg-[#0b0f19]/80 hover:bg-slate-850 text-slate-450 hover:text-white rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest pl-1 shrink-0">
            E2E P2P
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#070b16]/60 p-1.5 rounded-2xl mx-4 my-2.5 space-x-1 shrink-0 border border-slate-850/85">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-[#1a233d]/85 text-white border border-[#3b82f6]/20 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('game')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 relative ${
            activeTab === 'game'
              ? 'bg-[#1a233d]/85 text-white border border-[#3b82f6]/20 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Game</span>
          {/* Notification badge */}
          {['receiving_invite', 'playing'].includes(gameStatus) && activeTab !== 'game' && (
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('doodle')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'doodle'
              ? 'bg-[#1a233d]/85 text-white border border-[#3b82f6]/20 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Doodle</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'chat' ? (
        <>
          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[220px] flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 my-auto">
                <span className="text-5xl mb-4 animate-wave origin-[70%_70%] inline-block">👋</span>
                <h4 className="text-base font-extrabold text-white mb-1.5 font-sans tracking-wide">Say Hello!</h4>
                <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                  Send a message to start the conversation with the stranger.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble 
                  key={index} 
                  message={msg} 
                  translatedText={translatedMessages[`${msg.timestamp}_${msg.text}`]}
                  theme={msg.isMe ? myTheme : partnerTheme}
                  senderName={msg.isMe ? 'You' : partnerNickname}
                />
              ))
            )}

            {/* Stranger Typing Status */}
            {strangerIsTyping && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-450 animate-pulse mt-2 mb-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span>{partnerNickname} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Helper & Theme selector tray */}
          <div className="px-4 py-2 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/20 select-none">
            {/* Emojis list */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="hover:scale-125 transition-transform duration-100 text-lg py-0.5 px-1.5 rounded hover:bg-slate-800"
                  title={`Send floating ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Theme dots list */}
            {activeTab === 'chat' && (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3 ml-2 shrink-0">
                {THEME_DOTS.map((td) => (
                  <button
                    type="button"
                    key={td.name}
                    onClick={() => changeTheme(td.name)}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-100 ${td.color} ${
                      myTheme === td.name 
                        ? 'ring-2 ring-offset-2 ring-offset-[#0d1424] ring-blue-500 scale-110 shadow-sm' 
                        : 'opacity-70'
                    }`}
                    title={`Theme: ${td.name}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input container */}
          <form onSubmit={handleSendSubmit} className="p-4 border-t border-slate-800/60 flex items-center gap-2.5 relative bg-slate-950/20">
            {/* Emoji Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiGrid(!showEmojiGrid)}
                className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition shrink-0"
              >
                <Smile className="w-5 h-5 text-slate-400 hover:text-slate-200" />
              </button>

              {/* Expanded Emoji Grid popup */}
              {showEmojiGrid && (
                <div className="absolute bottom-12 left-0 bg-[#0f172a] border border-slate-800 shadow-2xl p-3 rounded-2xl grid grid-cols-4 gap-2 z-50 w-44 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {['😄', '❤️', '😂', '👍', '🔥', '😭', '😮', '🎉', '💡', '😎', '💀', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      className="hover:bg-slate-800 text-xl p-1 rounded transition text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Icebreaker button */}
            <button
              type="button"
              onClick={handleGetIcebreaker}
              title="Get Conversation Starter"
              className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition shrink-0"
            >
              <Sparkles className="w-5 h-5 text-slate-400 hover:text-slate-200" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type message here..."
              className="flex-1 bg-[#0b0f19]/70 border border-slate-800/80 text-white placeholder-slate-550 rounded-2xl px-4.5 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-[#121829] hover:bg-[#1a233b] disabled:bg-[#0b0f19] border border-slate-800 hover:border-slate-700 text-blue-500 disabled:text-slate-650 rounded-2xl transition duration-150 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : activeTab === 'game' ? (
        <div className="flex-1 flex flex-col min-h-[300px] bg-slate-950/10">
          {/* Sub-tab navigation */}
          <div className="flex border-b border-slate-800/60 bg-slate-950/20 px-4 py-2 space-x-1.5 shrink-0 select-none">
            {['tictactoe', 'wyr', 'soundboard'].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => changeGameTab(tab)}
                className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition duration-100 ${
                  activeGameTab === tab
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab === 'tictactoe' && '🎮 Tic-Tac-Toe'}
                {tab === 'wyr' && '❓ Would You Rather'}
                {tab === 'soundboard' && '🔊 Soundboard'}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col p-5 overflow-y-auto justify-center">
            {activeGameTab === 'tictactoe' ? (
              <>
                {/* game invitation state */}
                {gameStatus === 'idle' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-xl mb-4">
                      🎮
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Tic-Tac-Toe Challenge</h4>
                    <p className="text-xs text-slate-400 max-w-[200px] mb-5">
                      Bored? Challenge the stranger to a quick game of Tic-Tac-Toe to break the ice!
                    </p>
                    <button
                      type="button"
                      onClick={sendGameInvite}
                      className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-650 hover:from-brand-500 hover:to-indigo-550 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/10"
                    >
                      Send Challenge
                    </button>
                  </div>
                )}

                {gameStatus === 'invited' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-xl mb-4 animate-bounce">
                      ⏳
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Challenge Sent!</h4>
                    <p className="text-xs text-slate-400 max-w-[200px]">
                      Waiting for the stranger to accept your Tic-Tac-Toe invitation...
                    </p>
                  </div>
                )}

                {gameStatus === 'receiving_invite' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6 bg-brand-500/10 border border-brand-500/25 rounded-2xl p-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-xl mb-4 animate-pulse">
                      ⚔️
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">Game Challenge!</h4>
                    <p className="text-xs text-slate-400 max-w-[200px] mb-5">
                      Stranger has challenged you to a game of Tic-Tac-Toe.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={acceptGameInvite}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={declineGameInvite}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Active play or completed states */}
                {['playing', 'won', 'lost', 'draw'].includes(gameStatus) && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Game Info Status */}
                    <div className="w-full flex items-center justify-between border-b border-slate-800/60 pb-2.5 mb-4">
                      <span className="text-[11px] font-bold text-slate-400">
                        Your symbol: <strong className="text-brand-400 font-extrabold">{isInitiator ? 'X' : 'O'}</strong>
                      </span>
                      
                      {gameStatus === 'playing' ? (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isMyTurn 
                            ? 'bg-green-500/15 border-green-500/20 text-green-400 animate-pulse'
                            : 'bg-slate-900 border-slate-850 text-slate-450'
                        }`}>
                          {isMyTurn ? '🟢 Your Turn' : '⏳ Stranger\'s Turn'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Game Over
                        </span>
                      )}
                    </div>

                    {/* Board Grid */}
                    <div className="relative">
                      <div className="grid grid-cols-3 gap-2 w-[210px] h-[210px]">
                        {board.map((cell, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isMyTurn || cell !== null || gameStatus !== 'playing'}
                            onClick={() => makeGameMove(idx)}
                            className={`w-[64px] h-[64px] rounded-xl border transition duration-150 flex items-center justify-center text-2xl font-extrabold shadow-sm ${
                              cell === null 
                                ? isMyTurn && gameStatus === 'playing'
                                  ? 'bg-slate-900 border-slate-850 hover:border-brand-500 hover:scale-[1.03] active:scale-[0.98]'
                                  : 'bg-slate-950/40 border-slate-900 cursor-not-allowed text-slate-700'
                                : cell === 'X'
                                  ? 'bg-brand-500/15 border border-brand-500/30 text-brand-400'
                                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            }`}
                          >
                            {cell}
                          </button>
                        ))}
                      </div>

                      {/* Overlays for end conditions */}
                      {gameStatus !== 'playing' && (
                        <div className="absolute inset-0 bg-[#0b0f19]/95 backdrop-blur-[2px] border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-3 text-center z-10 transition">
                          {gameStatus === 'won' && (
                            <>
                              <span className="text-3xl mb-1.5">🎉</span>
                              <h4 className="text-sm font-extrabold text-green-400">You Won!</h4>
                              <p className="text-[10px] text-slate-500 mb-3">Excellent play!</p>
                            </>
                          )}
                          {gameStatus === 'lost' && (
                            <>
                              <span className="text-3xl mb-1.5">😢</span>
                              <h4 className="text-sm font-extrabold text-slate-200">Stranger Won</h4>
                              <p className="text-[10px] text-slate-500 mb-3">Better luck next round!</p>
                            </>
                          )}
                          {gameStatus === 'draw' && (
                            <>
                              <span className="text-3xl mb-1.5">🤝</span>
                              <h4 className="text-sm font-extrabold text-slate-250">It's a Draw</h4>
                              <p className="text-[10px] text-slate-500 mb-3">Balanced match!</p>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={resetGame}
                            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-650 hover:from-brand-500 hover:to-indigo-550 text-white text-[11px] font-bold rounded-lg transition duration-150 shadow-md shadow-brand-500/10"
                          >
                            Play Again
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : activeGameTab === 'wyr' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-sm bg-slate-950/20 border border-slate-850/60 rounded-2xl p-5 shadow-sm">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1.5 rounded-full mb-3.5 inline-block">
                    Icebreaker Game
                  </span>
                  <h4 className="text-sm font-bold text-white mb-4">Would You Rather...</h4>
                  
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Option A */}
                    <button
                      type="button"
                      disabled={myWyrVote !== null}
                      onClick={() => voteWyr('A')}
                      className={`w-full py-3 px-3.5 rounded-xl border text-[12.5px] font-semibold transition ${
                        myWyrVote === 'A'
                          ? 'bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-md shadow-brand-500/5'
                          : myWyrVote !== null
                            ? 'bg-slate-900/40 border-slate-850 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 hover:border-brand-500 hover:bg-brand-500/5 hover:text-brand-400 active:scale-[0.99]'
                      }`}
                    >
                      <span className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5">Option A</span>
                      {WOULD_YOU_RATHER_QUESTIONS[wyrIndex]?.optionA || ''}
                    </button>

                    <span className="text-[10px] font-bold text-slate-550 select-none">― OR ―</span>

                    {/* Option B */}
                    <button
                      type="button"
                      disabled={myWyrVote !== null}
                      onClick={() => voteWyr('B')}
                      className={`w-full py-3 px-3.5 rounded-xl border text-[12.5px] font-semibold transition ${
                        myWyrVote === 'B'
                          ? 'bg-brand-500/10 border-brand-500/40 text-brand-400 shadow-md shadow-brand-500/5'
                          : myWyrVote !== null
                            ? 'bg-slate-900/40 border-slate-850 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 hover:border-brand-500 hover:bg-brand-500/5 hover:text-brand-400 active:scale-[0.99]'
                      }`}
                    >
                      <span className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5">Option B</span>
                      {WOULD_YOU_RATHER_QUESTIONS[wyrIndex]?.optionB || ''}
                    </button>
                  </div>

                  {/* Vote status or results reveal */}
                  <div className="border-t border-slate-800/60 pt-3 text-[11px] font-semibold">
                    {myWyrVote === null ? (
                      <span className="text-slate-500 italic">Tap your choice above to answer!</span>
                    ) : partnerWyrVote === null ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-brand-400 animate-pulse">⏳ Waiting for stranger...</span>
                        <span className="text-[10px] text-slate-500">You voted Option {myWyrVote}</span>
                      </div>
                    ) : (
                      <div className="bg-slate-900/60 rounded-xl p-3 flex flex-col gap-2 border border-slate-850">
                        <span className="text-green-400 block text-[11px] font-bold">✨ Answers Revealed!</span>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-350">
                          <div className="bg-[#0b0f19]/70 p-2 rounded-lg border border-slate-850">
                            <span className="font-bold block text-[9px] text-slate-500 mb-0.5">You Chose:</span>
                            <span className="text-white font-bold">{myWyrVote === 'A' ? 'Option A' : 'Option B'}</span>
                          </div>
                          <div className="bg-[#0b0f19]/70 p-2 rounded-lg border border-slate-850">
                            <span className="font-bold block text-[9px] text-slate-500 mb-0.5">Stranger Chose:</span>
                            <span className="text-white font-bold">{partnerWyrVote === 'A' ? 'Option A' : 'Option B'}</span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => nextWyrQuestion((wyrIndex + 1) % WOULD_YOU_RATHER_QUESTIONS.length)}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 text-[10.5px] font-bold transition mt-1"
                        >
                          Next Question Card
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h4 className="text-xs font-bold text-white mb-1">Interactive Soundboard</h4>
                <p className="text-[10px] text-slate-450 max-w-[210px] mb-5">
                  Trigger funny retro synthesiser sound effects directly on the stranger's speakers!
                </p>
                
                <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => playSfxShared('laser')}
                    className="py-3 px-2 bg-slate-900 border border-slate-800/80 hover:border-brand-500 hover:bg-brand-500/5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-[0.97] shadow-sm font-semibold text-slate-300 text-[11px]"
                  >
                    <span className="text-lg select-none">📡</span>
                    <span>Laser Beam</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => playSfxShared('coin')}
                    className="py-3 px-2 bg-slate-900 border border-slate-800/80 hover:border-brand-500 hover:bg-brand-500/5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-[0.97] shadow-sm font-semibold text-slate-300 text-[11px]"
                  >
                    <span className="text-lg select-none">🪙</span>
                    <span>Retro Coin</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => playSfxShared('powerup')}
                    className="py-3 px-2 bg-slate-900 border border-slate-800/80 hover:border-brand-500 hover:bg-brand-500/5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-[0.97] shadow-sm font-semibold text-slate-300 text-[11px]"
                  >
                    <span className="text-lg select-none">⚡</span>
                    <span>Power Up</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => playSfxShared('jump')}
                    className="py-3 px-2 bg-slate-900 border border-slate-800/80 hover:border-brand-500 hover:bg-brand-500/5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-[0.97] shadow-sm font-semibold text-slate-300 text-[11px]"
                  >
                    <span className="text-lg select-none">🦘</span>
                    <span>Spring Jump</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playSfxShared('gameover')}
                    className="py-2.5 px-2 bg-slate-900 border border-slate-800/80 hover:border-brand-500 hover:bg-brand-500/5 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.97] col-span-2 shadow-sm font-semibold text-slate-300 text-[11.5px]"
                  >
                    <span className="text-base select-none">💀</span>
                    <span>Game Over Chord</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <DoodleBoard />
      )}
    </div>
  );
}
