import React from 'react';

const ME_THEMES = {
  blue: 'bg-gradient-to-br from-blue-500 to-indigo-650 text-white rounded-2xl rounded-tr-none shadow-lg shadow-blue-500/15 border border-blue-400/25',
  purple: 'bg-gradient-to-br from-purple-500 to-indigo-650 text-white rounded-2xl rounded-tr-none shadow-lg shadow-indigo-500/15 border border-purple-400/25',
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-650 text-white rounded-2xl rounded-tr-none shadow-lg shadow-emerald-500/15 border border-emerald-400/25',
  rose: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl rounded-tr-none shadow-lg shadow-rose-500/15 border border-rose-400/25',
  amber: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl rounded-tr-none shadow-lg shadow-amber-500/15 border border-amber-400/25',
};

const PARTNER_THEMES = {
  blue: 'bg-[#151d30]/90 border border-slate-800/80 text-slate-100 rounded-2xl rounded-tl-none shadow-md shadow-black/10',
  purple: 'bg-[#1a1738]/90 border border-indigo-900/40 text-indigo-200 rounded-2xl rounded-tl-none shadow-md shadow-black/10',
  emerald: 'bg-[#0d221c]/90 border border-emerald-900/40 text-emerald-200 rounded-2xl rounded-tl-none shadow-md shadow-black/10',
  rose: 'bg-[#29121f]/90 border border-rose-900/40 text-rose-200 rounded-2xl rounded-tl-none shadow-md shadow-black/10',
  amber: 'bg-[#2b1b11]/90 border border-amber-900/40 text-amber-250 rounded-2xl rounded-tl-none shadow-md shadow-black/10',
};

export default function MessageBubble({ message, translatedText, theme = 'blue', senderName = 'Stranger' }) {
  const { text, isMe, timestamp } = message;

  // Format timestamp (e.g. 10:24 AM)
  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bubbleStyle = isMe 
    ? ME_THEMES[theme] || ME_THEMES.blue
    : PARTNER_THEMES[theme] || PARTNER_THEMES.blue;

  return (
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} mb-3.5 px-2 animate-in fade-in slide-in-from-bottom-1 duration-150`}>
      {/* Sender Tag */}
      <span className="text-[10px] font-bold mb-1 px-1.5 flex items-center gap-1 text-slate-400">
        <span className={isMe ? "text-indigo-400" : "text-blue-400"}>
          {isMe ? 'You' : senderName}
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-500 font-medium">{timeString}</span>
      </span>

      {/* Message Text Bubble */}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] font-semibold leading-relaxed break-words transition-all duration-150 ${bubbleStyle}`}
      >
        <div>{text}</div>
        {translatedText && (
          <div className="mt-2 pt-1.5 border-t border-white/10 text-[11px] opacity-90 font-medium flex items-center gap-1 select-all text-indigo-200">
            <span className="text-[10px]">🌐</span>
            <span>{translatedText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
