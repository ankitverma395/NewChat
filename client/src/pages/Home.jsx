import React, { useState } from 'react';
import { Video, Sparkles, ShieldAlert, Check, MessageSquare, X, Hash } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const SUGGESTED_INTERESTS = [
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Coding', emoji: '💻' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Movies', emoji: '🎬' },
  { label: 'Anime', emoji: '🍿' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Books', emoji: '📚' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Travel', emoji: '✈️' }
];

export default function Home() {
  const { joinChatQueue, nickname, setNickname } = useChat();
  const [selectedMode, setSelectedMode] = useState('video'); // 'video' | 'text'
  const [interestInput, setInterestInput] = useState('');
  const [interestList, setInterestList] = useState([]);

  // Add tag when user presses Enter or comma
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

  // Remove tag
  const removeInterest = (indexToRemove) => {
    setInterestList(interestList.filter((_, idx) => idx !== indexToRemove));
  };

  // Toggle suggested tag
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-12">
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-premium text-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Connect instantly with strangers worldwide</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-sans leading-tight">
          Talk to Strangers, <br />
          <span className="text-brand-600">Anonymously.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mb-5 leading-relaxed">
          Free random video and text chat. Peer-to-peer connection. Zero signups. Choose your mode and start chatting!
        </p>

        {/* 1. Chat Mode Selection Card Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-5">
          <button
            onClick={() => setSelectedMode('video')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition duration-200 ${
              selectedMode === 'video'
                ? 'border-brand-500 bg-brand-50/40 text-brand-700 shadow-md shadow-brand-100/50'
                : 'border-slate-100 hover:border-slate-200 bg-white text-slate-500 hover:text-slate-700'
            }`}
          >
            <Video className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Video Chat</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Camera + Audio + Chat</span>
          </button>

          <button
            onClick={() => setSelectedMode('text')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition duration-200 ${
              selectedMode === 'text'
                ? 'border-brand-500 bg-brand-50/40 text-brand-700 shadow-md shadow-brand-100/50'
                : 'border-slate-100 hover:border-slate-200 bg-white text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-6 h-6 mb-2" />
            <span className="text-sm font-bold">Text Chat</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Instant Messaging Only</span>
          </button>
        </div>

        {/* Nickname / Alias input section */}
        <div className="max-w-md mx-auto mb-5 text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Your Nickname (Optional)
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="E.g. CaptainCool, Anonymous..."
            maxLength={18}
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition"
          />
        </div>

        {/* 2. Interests input section */}
        <div className="max-w-md mx-auto mb-6 text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Interests (Optional)
          </label>
          <div className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl p-2.5 transition focus-within:border-brand-500 focus-within:bg-white min-h-[50px] flex flex-wrap gap-1.5 items-center">
            {interestList.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 bg-white border border-slate-150 text-slate-700 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-lg"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(idx)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50"
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
              placeholder={interestList.length === 0 ? "Add interests (e.g. coding, gaming)" : "Add more..."}
              className="flex-1 bg-transparent border-none text-sm font-medium text-slate-800 focus:outline-none min-w-[120px] px-1.5 py-0.5"
            />
          </div>

          {/* Quick suggestions */}
          <div className="mt-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Popular Tags:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_INTERESTS.map((item) => {
                const isSelected = interestList.includes(item.label.toLowerCase());
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleToggleSuggestion(item.label)}
                    className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full transition border ${
                      isSelected
                        ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-150 text-slate-600'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="group relative w-full sm:w-auto min-w-[240px] px-8 py-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-lg rounded-2xl transition duration-150 ease-in-out shadow-lg shadow-brand-100 hover:shadow-xl hover:shadow-brand-200 transform hover:-translate-y-0.5"
        >
          {selectedMode === 'video' ? 'Start Video Chat' : 'Start Text Chat'}
        </button>

        {/* Features Checklist */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 border-t border-slate-100 pt-6 max-w-md mx-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span>Anonymous</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span>Free</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span>Interest Matching</span>
          </div>
        </div>
      </div>

      {/* Safety Alert card */}
      <div className="mt-6 flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 max-w-lg text-xs font-medium">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <p>
          <strong>Safety Warning:</strong> Please behave respectfully. Do not share your personal information (name, social links, location) with strangers. Keep chat fun and clean.
        </p>
      </div>
    </div>
  );
}
