import React, { useEffect, useRef } from 'react';
import { VideoOff, User } from 'lucide-react';

export default function LocalVideo({ stream, isVideoEnabled, filterClass }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-premium border border-white/20 aspect-video sm:aspect-auto">
      {isVideoEnabled && stream ? (
        <video
          id="local-video"
          ref={videoRef}
          autoPlay
          playsInline
          muted // Must be muted locally!
          className={`w-full h-full object-cover mirror-mode ${filterClass || ''}`}
          style={{ transform: 'scaleX(-1)' }} // Mirror local view for natural feel
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-400">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mb-1">
            <VideoOff className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">Camera Off</span>
        </div>
      )}

      {/* Label overlay */}
      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
        <User className="w-3 h-3 text-brand-300" />
        <span>You (Preview)</span>
      </div>
    </div>
  );
}
