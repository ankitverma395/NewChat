import React from 'react';
import { ShieldCheck, Flame, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto bg-white border-t border-slate-100 text-slate-400 text-xs sm:text-sm font-medium">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quality flags */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            100% Anonymous
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-brand-500" />
            P2P Video Streams
          </span>
        </div>

        {/* Copy */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>&copy; {new Date().getFullYear()} StrangerChat.</span>
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          <span>for safe chat.</span>
        </div>
      </div>
    </footer>
  );
}
