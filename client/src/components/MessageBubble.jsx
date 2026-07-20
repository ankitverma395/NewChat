import React from 'react';

const ME_THEMES = {
  blue: 'bg-brand-600 text-white rounded-tr-none shadow-brand-100/20',
  purple: 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100/20',
  emerald: 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-100/20',
  rose: 'bg-rose-500 text-white rounded-tr-none shadow-rose-100/20',
  amber: 'bg-amber-500 text-white rounded-tr-none shadow-amber-100/20',
};

const PARTNER_THEMES = {
  blue: 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50',
  purple: 'bg-indigo-50/40 text-indigo-950 rounded-tl-none border border-indigo-100/70',
  emerald: 'bg-emerald-50/40 text-emerald-950 rounded-tl-none border border-emerald-100/70',
  rose: 'bg-rose-50/40 text-rose-950 rounded-tl-none border border-rose-100/70',
  amber: 'bg-amber-50/30 text-amber-950 rounded-tl-none border border-amber-100/70',
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
