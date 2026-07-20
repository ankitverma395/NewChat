import React, { useEffect, useRef } from 'react';
import { VideoOff, User } from 'lucide-react';

export default function LocalVideo({ stream, isVideoEnabled, filterClass }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoEnabled]);

  return (
    <div className="relative w-full h-full bg-[#0b0f19] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 aspect-video sm:aspect-auto flex flex-col items-center justify-center">
      {isVideoEnabled && stream ? (
        <>
          <video
            id="local-video"
            ref={videoRef}
            autoPlay
            playsInline
            muted // Must be muted locally!
            className={`w-full h-full object-cover mirror-mode ${filterClass || ''}`}
            style={{ transform: 'scaleX(-1)' }} // Mirror local view for natural feel
          />
          {/* Label overlay (bottom-left) */}
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border border-white/5 shadow-sm">
            <User className="w-3 h-3 text-blue-400" />
            <span>You (Preview)</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1222] text-slate-400 p-2">
          <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center mb-2 bg-[#080d1a]/50">
            <VideoOff className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-xs font-extrabold text-white mb-2 tracking-wide">Camera Off</span>
          
          {/* Mockup-style centered You (Preview) label */}
          <div className="bg-[#121829]/90 border border-slate-800/80 text-slate-300 text-[10px] sm:text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 shadow-sm">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>You (Preview)</span>
          </div>
        </div>
      )}
    </div>
  );
}
