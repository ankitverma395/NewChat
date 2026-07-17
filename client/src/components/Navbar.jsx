import React, { useState, useEffect } from 'react';
import { Video, Activity } from 'lucide-react';
import { getServerStats } from '../services/api';
import { useChat } from '../context/ChatContext';

export default function Navbar() {
  const [activeUsers, setActiveUsers] = useState(0);
  const { matchState } = useChat();

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
    <nav className="w-full bg-white border-b border-slate-100 py-4 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-100">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Stranger<span className="text-brand-600">Chat</span></span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Beta</span>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              {activeUsers} active now
            </span>
          </div>

          {matchState === 'chatting' && (
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 animate-pulse bg-brand-50 px-2.5 py-1 rounded">
              Connected
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
