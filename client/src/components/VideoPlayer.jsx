import React, { useState } from 'react';
import RemoteVideo from './RemoteVideo';
import LocalVideo from './LocalVideo';
import { MessageSquare, Sparkles, Hash } from 'lucide-react';

const FILTER_CLASSES = {
  normal: '',
  grayscale: 'grayscale',
  sepia: 'sepia',
  vintage: 'sepia-[0.4] contrast-125 brightness-95',
  cool: 'hue-rotate-[180deg] saturate-125',
  warm: 'sepia-[0.25] saturate-125 contrast-105',
  invert: 'invert',
  blur: 'blur-md',
};

export default function VideoPlayer({
  localStream,
  remoteStream,
  isVideoEnabled,
  strangerIsTyping,
  matchState,
  videoContainerRef,
  isChatOpen,
  chatMode = 'video',
  interests = [],
  partnerInterests = [],
  commonInterests = [],
  partnerNickname = 'Stranger',
  connectionStats = { ping: null, quality: 'checking' },
}) {
  const [activeFilter, setActiveFilter] = useState('normal');

  // Text Chat Dashboard
  if (chatMode === 'text') {
    return (
      <div
        ref={videoContainerRef}
        className={`relative bg-slate-900 text-white rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8 shadow-premium transition-all duration-300 ${
          isChatOpen
            ? 'h-[25vh] sm:h-[38vh] lg:h-full lg:col-span-8'
            : 'flex-1 lg:h-full lg:col-span-12'
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          {/* Animated/Styled Chat Mode Graphic */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-6 text-brand-400">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            Chatting with {partnerNickname}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            You are connected in text-only mode. Audio and video streams are disabled.
          </p>

          {/* Interests display */}
          <div className="w-full bg-slate-800/40 border border-slate-700/30 p-4 sm:p-5 rounded-2xl mb-6 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Matchmaking Analysis
            </h4>

            {commonInterests.length > 0 ? (
              <div className="mb-4">
                <span className="text-xs font-semibold text-green-400 block mb-1.5">
                  🤝 You both have in common:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {commonInterests.map((tag) => (
                    <span key={tag} className="inline-flex items-center text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 text-xs text-slate-400 italic">
                No overlapping tags found. Connected randomly.
              </div>
            )}

            {/* Partner's tags */}
            {partnerInterests.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                  👤 {partnerNickname}'s interests:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {partnerInterests.map((tag) => (
                    <span key={tag} className="inline-flex items-center text-xs font-semibold bg-slate-700/50 border border-slate-600/30 text-slate-300 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-slate-500 italic">
            Tip: Use the control bar below to skip to the next stranger.
          </p>
        </div>
      </div>
    );
  }

  // Video Chat Viewport
  return (
    <div
      ref={videoContainerRef}
      className={`relative bg-slate-900 rounded-3xl overflow-hidden flex flex-col shadow-premium transition-all duration-300 ${
        isChatOpen
          ? 'h-[25vh] sm:h-[38vh] lg:h-full lg:col-span-8'
          : 'flex-1 lg:h-full lg:col-span-12'
      }`}
    >
      {/* Visual Filters Selector */}
      {matchState === 'chatting' && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="bg-black/55 hover:bg-black/75 text-white text-[11px] font-bold py-1.5 px-3 rounded-full border border-white/10 outline-none backdrop-blur-md cursor-pointer transition shadow-md"
          >
            <option value="normal" className="bg-slate-900">✨ No Filter</option>
            <option value="grayscale" className="bg-slate-900">📷 Black & White</option>
            <option value="sepia" className="bg-slate-900">🍂 Sepia</option>
            <option value="vintage" className="bg-slate-900">🎞️ Vintage</option>
            <option value="cool" className="bg-slate-900">❄️ Cool Blue</option>
            <option value="warm" className="bg-slate-900">🔥 Warm Golden</option>
            <option value="invert" className="bg-slate-900">🎨 Inverted</option>
            <option value="blur" className="bg-slate-900">🌫️ Blur Camera</option>
          </select>
        </div>
      )}

      {/* Main Remote Video viewport */}
      <div className="flex-1 relative min-h-0 bg-slate-955">
        <RemoteVideo
          stream={remoteStream}
          isPartnerTyping={strangerIsTyping}
          matchState={matchState}
          filterClass={FILTER_CLASSES[activeFilter]}
          partnerNickname={partnerNickname}
          connectionStats={connectionStats}
        />

        {/* Floating Local Video preview */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-48 sm:h-36 max-w-[30%] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 transition hover:scale-105">
            <LocalVideo
              stream={localStream}
              isVideoEnabled={isVideoEnabled}
              filterClass={FILTER_CLASSES[activeFilter]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
