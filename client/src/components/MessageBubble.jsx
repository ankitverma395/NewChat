import React from 'react';

const ME_THEMES = {
  blue: 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-500/10',
  purple: 'bg-indigo-650 text-white rounded-tr-none shadow-lg shadow-indigo-500/10',
  emerald: 'bg-emerald-650 text-white rounded-tr-none shadow-lg shadow-emerald-500/10',
  rose: 'bg-rose-600 text-white rounded-tr-none shadow-lg shadow-rose-500/10',
  amber: 'bg-amber-650 text-white rounded-tr-none shadow-lg shadow-amber-500/10',
};

const PARTNER_THEMES = {
  blue: 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none',
  purple: 'bg-indigo-950/40 border border-indigo-900/30 text-indigo-200 rounded-tl-none',
  emerald: 'bg-emerald-950/40 border border-emerald-900/30 text-emerald-200 rounded-tl-none',
  rose: 'bg-rose-950/40 border border-rose-900/30 text-rose-200 rounded-tl-none',
  amber: 'bg-amber-950/30 border border-amber-900/30 text-amber-200 rounded-tl-none',
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
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      {/* Sender Tag */}
      <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
        {isMe ? 'You' : senderName} • {timeString}
      </span>

      {/* Message Text Bubble */}
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed break-words transition-colors duration-150 ${bubbleStyle}`}
      >
        <div>{text}</div>
        {translatedText && (
          <div className="mt-1.5 pt-1.5 border-t border-current/20 text-xs opacity-85 font-semibold flex items-center gap-1 select-all">
            <span className="text-[10px]">🌐</span>
            <span>{translatedText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
