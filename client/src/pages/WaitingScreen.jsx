import React, { useEffect } from 'react';
import { UserMinus, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WaitingScreen() {
  const { leaveChat, joinChatQueue } = useChat();

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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Searching for a stranger...</h2>
        <p className="text-sm font-medium text-slate-400 mb-8 max-w-xs mx-auto">
          Finding someone online. This should take just a moment.
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
