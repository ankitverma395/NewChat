import React from 'react';
import { ShieldCheck, Flame, Heart } from 'lucide-react';

export default function Footer({ onOpenTerms }) {
  return (
    <footer className="w-full py-6 mt-auto bg-[#070b14]/60 backdrop-blur-md border-t border-slate-800/40 text-slate-500 text-xs sm:text-sm font-semibold z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quality flags */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            100% Anonymous
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-brand-400" />
            P2P Video Streams
          </span>
        </div>

        {/* Copy */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500">
          <span>&copy; {new Date().getFullYear()} StrangerChat.</span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-slate-300 transition-colors underline"
          >
            Terms of Service
          </button>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>for safe chat.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
