import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Download, Sparkles, Volume2, VolumeX } from 'lucide-react';
import MessageBubble from './MessageBubble';
import DoodleBoard from './DoodleBoard';
import { useChat } from '../context/ChatContext';

const QUICK_EMOJIS = ['👋', '😊', '😂', '😮', '👍', '❤️', '🔥', '🎉'];

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
    <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-premium">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-800">Room Chat</h3>
        <div className="flex items-center space-x-2.5">
          {/* Real-time Translator Dropdown */}
          {activeTab === 'chat' && (
            <select
              value={translationLang}
              onChange={(e) => setTranslationLang(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-500 focus:outline-none transition cursor-pointer"
            >
              <option value="none">🌐 Off</option>
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
              <option value="ja">🇯🇵 JA</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="zh">🇨🇳 ZH</option>
            </select>
          )}

          {/* Sound FX Toggle Button */}
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setSoundsEnabled(!soundsEnabled)}
              title={soundsEnabled ? "Mute Sound Effects" : "Unmute Sound Effects"}
              className={`p-1 rounded transition ${
                soundsEnabled ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200' : 'text-red-500 hover:text-red-650 hover:bg-red-50'
              }`}
            >
              {soundsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* TTS Read Aloud Toggle Button */}
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? "Disable Text-to-Speech (TTS)" : "Enable Text-to-Speech (TTS) to read messages aloud"}
              className={`text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1 ${
                ttsEnabled 
                  ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200/50'
              }`}
            >
              <span>🗣️</span>
              <span className="hidden sm:inline">TTS</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportChat}
              title="Save Chat Log"
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            End-to-End P2P
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/20 px-3 py-2 space-x-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            activeTab === 'chat'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          💬 Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('game')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition relative ${
            activeTab === 'game'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          <span>🎮 Tic-Tac-Toe</span>
          {/* Notification badge */}
          {['receiving_invite', 'playing'].includes(gameStatus) && activeTab !== 'game' && (
            <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-brand-500 animate-ping" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('doodle')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition relative ${
            activeTab === 'doodle'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
          }`}
        >
          <span>🎨 Doodle</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'chat' ? (
        <>
          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[220px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <span className="text-3xl mb-2">👋</span>
                <h4 className="text-sm font-bold text-slate-600 mb-0.5">Say Hello!</h4>
                <p className="text-xs max-w-[200px]">Send a message to start the conversation with the stranger.</p>
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
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 animate-pulse mt-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span>{partnerNickname} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Helper & Theme selector tray */}
          <div className="px-4 py-2 border-t border-slate-50 flex items-center justify-between bg-slate-50/20 select-none">
            {/* Emojis list */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => handleAddEmoji(emoji)}
                  className="hover:scale-125 transition-transform duration-100 text-base py-0.5 px-1.5 rounded hover:bg-slate-100"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Theme dots list */}
            {activeTab === 'chat' && (
              <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3 ml-2 shrink-0">
                {THEME_DOTS.map((td) => (
                  <button
                    type="button"
                    key={td.name}
                    onClick={() => changeTheme(td.name)}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-100 ${td.color} ${
                      myTheme === td.name 
                        ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-sm' 
                        : 'opacity-70'
                    }`}
                    title={`Theme: ${td.name}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input container */}
          <form onSubmit={handleSendSubmit} className="p-4 border-t border-slate-100 flex items-center gap-2 relative bg-white">
            {/* Emoji Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiGrid(!showEmojiGrid)}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Expanded Emoji Grid popup */}
              {showEmojiGrid && (
                <div className="absolute bottom-12 left-0 bg-white border border-slate-200 shadow-premium p-3 rounded-2xl grid grid-cols-4 gap-2 z-50 w-44">
                  {['😄', '❤️', '😂', '👍', '🔥', '😭', '😮', '🎉', '💡', '😎', '💀', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleAddEmoji(emoji)}
                      className="hover:bg-slate-50 text-xl p-1 rounded transition text-center"
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
              className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition shrink-0"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type message here..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition duration-150 shadow-md shadow-brand-100/50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : activeTab === 'game' ? (
        <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-[300px] bg-slate-50/30">
          {/* game invitation state */}
          {gameStatus === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-xl mb-4">
                🎮
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Tic-Tac-Toe Challenge</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mb-5">
                Bored? Challenge the stranger to a quick game of Tic-Tac-Toe to break the ice!
              </p>
              <button
                type="button"
                onClick={sendGameInvite}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition duration-150 shadow-md shadow-brand-100"
              >
                Send Challenge
              </button>
            </div>
          )}

          {gameStatus === 'invited' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-xl mb-4 animate-bounce">
                ⏳
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Challenge Sent!</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Waiting for the stranger to accept your Tic-Tac-Toe invitation...
              </p>
            </div>
          )}

          {gameStatus === 'receiving_invite' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 bg-brand-50/20 border border-brand-100/50 rounded-2xl p-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-xl mb-4 animate-pulse">
                ⚔️
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Game Challenge!</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mb-5">
                Stranger has challenged you to a game of Tic-Tac-Toe.
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={acceptGameInvite}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={declineGameInvite}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
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
              <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2.5 mb-4">
                <span className="text-[11px] font-bold text-slate-500">
                  Your symbol: <strong className="text-brand-600 font-extrabold">{isInitiator ? 'X' : 'O'}</strong>
                </span>
                
                {gameStatus === 'playing' ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isMyTurn 
                      ? 'bg-green-50 text-green-700 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isMyTurn ? '🟢 Your Turn' : '⏳ Stranger\'s Turn'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                            ? 'bg-white border-slate-200 hover:border-brand-500 hover:scale-[1.03] active:scale-[0.98]'
                            : 'bg-white/50 border-slate-100 cursor-not-allowed'
                          : cell === 'X'
                            ? 'bg-brand-50 border-brand-100 text-brand-600'
                            : 'bg-amber-50 border-amber-100 text-amber-500'
                      }`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>

                {/* Overlays for end conditions */}
                {gameStatus !== 'playing' && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center p-3 text-center z-10 transition">
                    {gameStatus === 'won' && (
                      <>
                        <span className="text-3xl mb-1.5">🎉</span>
                        <h4 className="text-sm font-extrabold text-green-600">You Won!</h4>
                        <p className="text-[10px] text-slate-400 mb-3">Excellent play!</p>
                      </>
                    )}
                    {gameStatus === 'lost' && (
                      <>
                        <span className="text-3xl mb-1.5">😢</span>
                        <h4 className="text-sm font-extrabold text-slate-700">Stranger Won</h4>
                        <p className="text-[10px] text-slate-400 mb-3">Better luck next round!</p>
                      </>
                    )}
                    {gameStatus === 'draw' && (
                      <>
                        <span className="text-3xl mb-1.5">🤝</span>
                        <h4 className="text-sm font-extrabold text-slate-700">It's a Draw</h4>
                        <p className="text-[10px] text-slate-400 mb-3">Balanced match!</p>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={resetGame}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg transition duration-150 shadow-md shadow-brand-100"
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <DoodleBoard />
      )}
    </div>
  );
}
