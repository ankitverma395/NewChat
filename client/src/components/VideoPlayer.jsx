import React, { useState } from 'react';
import RemoteVideo from './RemoteVideo';
import LocalVideo from './LocalVideo';
import { MessageSquare, Sparkles, Hash, ChevronDown } from 'lucide-react';
import { useChat } from '../context/ChatContext';

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
  const { reactions, dataSaverMode } = useChat();

  // Text Chat Dashboard
  if (chatMode === 'text') {
    return (
      <div
        ref={videoContainerRef}
        className={`relative bg-[#0d1424]/40 border border-slate-800/80 text-white rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
          isChatOpen
            ? 'h-[30vh] sm:h-[40vh] md:h-full md:col-span-3'
            : 'flex-1 md:h-full md:col-span-10'
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          {/* Animated/Styled Chat Mode Graphic */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 text-brand-400">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-brand-400 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <h3 className="text-xl sm:text-2xl font-black mb-2">
            Chatting with {partnerNickname}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
            You are connected in text-only mode. Audio and video streams are disabled.
          </p>

          {/* Interests display */}
          <div className="w-full bg-slate-905/65 border border-slate-800/50 p-4 sm:p-5 rounded-2xl mb-6 text-left">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Matchmaking Analysis
            </h4>

            {commonInterests.length > 0 ? (
              <div className="mb-4">
                <span className="text-xs font-semibold text-green-400 block mb-2">
                  🤝 You both have in common:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {commonInterests.map((tag) => (
                    <span key={tag} className="inline-flex items-center text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4 text-xs text-slate-500 italic">
                No overlapping tags found. Connected randomly.
              </div>
            )}

            {/* Partner's tags */}
            {partnerInterests.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-350 block mb-2">
                  👤 {partnerNickname}'s interests:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {partnerInterests.map((tag) => (
                    <span key={tag} className="inline-flex items-center text-xs font-semibold bg-slate-800 border border-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Reactions Overlay */}
        {!dataSaverMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {reactions.map((r) => (
              <span
                key={r.id}
                className="absolute bottom-0 text-3xl animate-float-emoji select-none"
                style={r.style}
              >
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Video Chat Viewport
  return (
    <div
      ref={videoContainerRef}
      className={`relative bg-[#0b0f19] border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${
        isChatOpen
          ? 'h-[32vh] sm:h-[42vh] md:h-full md:col-span-3'
          : 'flex-1 md:h-full md:col-span-10'
      }`}
    >
      {/* Visual Filters Selector */}
      {matchState !== 'disconnected' && (
        <div className="absolute top-4 right-4 z-20 flex items-center">
          <div className="relative flex items-center bg-black/50 backdrop-blur-md text-white text-xs rounded-full border border-white/15 shadow-lg hover:bg-black/70 transition pl-3 pr-7.5 py-1.5 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="bg-transparent text-[11px] font-extrabold outline-none cursor-pointer appearance-none pr-4 text-white"
            >
              <option value="normal" className="bg-[#0b0f19] text-white">No Filter</option>
              <option value="grayscale" className="bg-[#0b0f19] text-white">Black & White</option>
              <option value="sepia" className="bg-[#0b0f19] text-white">Sepia</option>
              <option value="vintage" className="bg-[#0b0f19] text-white">Vintage</option>
              <option value="cool" className="bg-[#0b0f19] text-white">Cool Blue</option>
              <option value="warm" className="bg-[#0b0f19] text-white">Warm Golden</option>
              <option value="invert" className="bg-[#0b0f19] text-white">Inverted</option>
              <option value="blur" className="bg-[#0b0f19] text-white">Blur Camera</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/70 absolute right-2.5 pointer-events-none" />
          </div>
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

        {/* Floating Reactions Overlay */}
        {!dataSaverMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {reactions.map((r) => (
              <span
                key={r.id}
                className="absolute bottom-0 text-3xl animate-float-emoji select-none"
                style={r.style}
              >
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
