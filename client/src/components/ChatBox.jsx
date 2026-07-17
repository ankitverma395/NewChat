import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import MessageBubble from './MessageBubble';

const QUICK_EMOJIS = ['👋', '😊', '😂', '😮', '👍', '❤️', '🔥', '🎉'];

export default function ChatBox({ messages, onSendMessage, onSendTypingStatus, strangerIsTyping }) {
  const [inputText, setInputText] = useState('');
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Auto-scroll to bottom of messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, strangerIsTyping]);

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

  return (
    <div className="flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-premium">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-800">Room Chat</h3>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          End-to-End P2P
        </span>
      </div>

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
            <MessageBubble key={index} message={msg} />
          ))
        )}

        {/* Stranger Typing Status */}
        {strangerIsTyping && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 animate-pulse mt-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span>Stranger is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Helper tray */}
      <div className="px-4 py-2 border-t border-slate-50 flex items-center gap-1.5 bg-slate-50/20 overflow-x-auto select-none">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleAddEmoji(emoji)}
            className="hover:scale-125 transition-transform duration-100 text-base py-0.5 px-1.5 rounded hover:bg-slate-100"
          >
            {emoji}
          </button>
        ))}
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
    </div>
  );
}
