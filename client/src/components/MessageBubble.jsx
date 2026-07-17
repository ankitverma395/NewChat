import React from 'react';

export default function MessageBubble({ message }) {
  const { text, isMe, timestamp } = message;

  // Format timestamp (e.g. 10:24 AM)
  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      {/* Sender Tag */}
      <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
        {isMe ? 'You' : 'Stranger'} • {timeString}
      </span>

      {/* Message Text Bubble */}
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed break-words ${
          isMe
            ? 'bg-brand-600 text-white rounded-tr-none'
            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
