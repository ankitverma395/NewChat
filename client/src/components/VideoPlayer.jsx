import React from 'react';
import RemoteVideo from './RemoteVideo';
import LocalVideo from './LocalVideo';

export default function VideoPlayer({
  localStream,
  remoteStream,
  isVideoEnabled,
  strangerIsTyping,
  matchState,
  videoContainerRef,
  isChatOpen,
}) {
  return (
    <div
      ref={videoContainerRef}
      className={`relative bg-slate-900 rounded-3xl overflow-hidden flex flex-col shadow-premium transition-all duration-300 ${
        isChatOpen
          ? 'h-[32vh] sm:h-[40vh] lg:h-full lg:col-span-8'
          : 'flex-1 lg:h-full lg:col-span-12'
      }`}
    >
      {/* Main Remote Video viewport */}
      <div className="flex-1 relative min-h-0 bg-slate-955">
        <RemoteVideo
          stream={remoteStream}
          isPartnerTyping={strangerIsTyping}
          matchState={matchState}
        />

        {/* Floating Local Video preview */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-48 sm:h-36 max-w-[30%] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 transition hover:scale-105">
            <LocalVideo stream={localStream} isVideoEnabled={isVideoEnabled} />
          </div>
        )}
      </div>
    </div>
  );
}
