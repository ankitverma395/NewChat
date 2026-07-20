import React from 'react';
import { UserMinus, Sparkles, Hash } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WaitingScreen() {
  const { leaveChat, chatMode, interests } = useChat();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-premium text-center">
        {/* Pulsing loading rings */}
        <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-brand-50 border border-brand-100 animate-ping opacity-70" />
          <div className="absolute inset-4 rounded-full bg-brand-100 border border-brand-200 animate-pulse-slow opacity-90" />
          <div className="relative w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-100">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Text descriptions */}
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Searching for a stranger...</h2>
        
        {/* Active search filters */}
        <div className="mb-6 mt-3">
          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 mb-2 capitalize">
            {chatMode === 'video' ? '📽️ Video Mode' : '💬 Text Mode'}
          </span>
          {interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1 max-w-xs mx-auto">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[10px] font-semibold bg-brand-50 border border-brand-100 text-brand-700 px-2 py-0.5 rounded-md"
                >
                  <Hash className="w-2.5 h-2.5 mr-0.5 text-brand-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-slate-400 mb-6 max-w-xs mx-auto">
          {interests.length > 0 
            ? "Looking for a match with similar interests first. If none are found, we'll connect you with a random stranger."
            : "Finding a random stranger online. This should take just a moment."}
        </p>

        {/* Spinner */}
        <LoadingSpinner size="sm" className="mb-8" />

        {/* Cancel Button */}
        <button
          onClick={leaveChat}
          className="inline-flex items-center space-x-2 px-6 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl transition duration-150"
        >
          <UserMinus className="w-4 h-4" />
          <span>Cancel Search</span>
        </button>
      </div>
    </div>
  );
}
