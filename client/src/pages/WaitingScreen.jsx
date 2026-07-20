import React from 'react';
import { UserMinus, Sparkles, Hash } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WaitingScreen() {
  const { leaveChat, chatMode, interests } = useChat();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20">
      <div className="w-full max-w-md bg-[#0d1424]/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50 text-center">
        {/* Pulsing loading rings (radar concept) */}
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-brand-500/5 border border-brand-500/10 animate-ping opacity-60" />
          <div className="absolute inset-4 rounded-full bg-brand-500/10 border border-brand-500/25 animate-pulse-slow opacity-80" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-indigo-650 flex items-center justify-center shadow-xl shadow-brand-500/30">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        {/* Text descriptions */}
        <h2 className="text-2xl font-bold text-white mb-2">Searching for a stranger...</h2>
        
        {/* Active search filters */}
        <div className="mb-6 mt-3">
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700/30 mb-2 capitalize">
            {chatMode === 'video' ? '📽️ Video Mode' : '💬 Text Mode'}
          </span>
          {interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-xs mx-auto">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[10px] font-semibold bg-brand-500/10 border border-brand-500/25 text-brand-400 px-2 py-0.5 rounded-md"
                >
                  <Hash className="w-2.5 h-2.5 mr-0.5 text-brand-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm font-medium text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
          {interests.length > 0 
            ? "Looking for a match with similar interests first. If none are found, we'll connect you with a random stranger."
            : "Finding a random stranger online. This should take just a moment."}
        </p>

        {/* Spinner */}
        <LoadingSpinner size="sm" className="mb-8" />

        {/* Cancel Button */}
        <button
          onClick={leaveChat}
          className="inline-flex items-center space-x-2 px-6 py-3 border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-450 hover:text-slate-200 font-semibold text-sm rounded-xl transition duration-150 active:scale-[0.98]"
        >
          <UserMinus className="w-4 h-4" />
          <span>Cancel Search</span>
        </button>
      </div>
    </div>
  );
}
