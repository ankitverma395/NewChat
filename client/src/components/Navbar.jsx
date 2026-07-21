import React, { useState, useEffect } from 'react';
import { Video, Activity, Sparkles } from 'lucide-react';
import { getServerStats } from '../services/api';
import { useChat } from '../context/ChatContext';
import FeedbackModal from './FeedbackModal';

export default function Navbar() {
  const [activeUsers, setActiveUsers] = useState(0);
  const { matchState, leaveChat } = useChat();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleLogoClick = () => {
    if (matchState !== 'idle') {
      if (window.confirm('Are you sure you want to leave the chat and return to the home page?')) {
        leaveChat();
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    const fetchStats = async () => {
      const stats = await getServerStats();
      if (stats && stats.activeUsers !== undefined) {
        setActiveUsers(stats.activeUsers);
      }
    };
    fetchStats();

    // Poll every 10 seconds for real-time stats
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="w-full bg-[#0c111e]/60 backdrop-blur-lg border-b border-slate-800/60 py-4 px-6 sm:px-8 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Name */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-105">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              Stranger<span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">Chat</span>
            </span>
            <span className="hidden sm:inline-block ml-2.5 text-[10px] font-bold px-2 py-0.5 bg-slate-800/80 text-slate-300 border border-slate-700/30 rounded-full">
              Beta
            </span>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900/80 border border-slate-800/60 px-3.5 py-1.5 rounded-full shadow-inner-soft">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeUsers} online</span>
            </span>
          </div>

          {/* Request Change feedback trigger button */}
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-1 text-[11px] font-black px-3.5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 transition duration-150 active:scale-95 shadow-md shadow-indigo-500/5 cursor-pointer shrink-0"
            title="Request Website Changes / Features"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Request Change</span>
            <span className="sm:hidden">Request</span>
          </button>

          {matchState === 'chatting' && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full animate-pulse">
              Connected
            </span>
          )}
        </div>
      </div>

      {/* Suggestion & Instagram Integration Modal */}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </nav>
  );
}
