import React, { useEffect, useRef } from 'react';
import { User, ShieldAlert, Radio } from 'lucide-react';

export default function RemoteVideo({ stream, isPartnerTyping, matchState }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (matchState === 'disconnected') {
    return (
      <div className="relative w-full h-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-4 text-red-500 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Stranger Disconnected</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          Searching for another stranger automatically... Please wait.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-3xl overflow-hidden shadow-soft flex items-center justify-center border border-slate-100">
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${
            stream.getVideoTracks().length > 0 ? '' : 'hidden'
          }`}
        />
      )}

      {(!stream || stream.getVideoTracks().length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-center p-4">
          <div className="w-16 h-16 rounded-full bg-brand-955/40 border border-brand-500/30 flex items-center justify-center mb-4 text-brand-500 animate-pulse-slow">
            <Radio className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Connecting Stream</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Establishing peer-to-peer WebRTC connection...
          </p>
        </div>
      )}

      {/* Stranger info overlay */}
      <div className="absolute top-4 left-4 bg-black/45 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
        <User className="w-3.5 h-3.5 text-slate-300" />
        <span>Stranger</span>
      </div>

      {/* Typing overlay indicator */}
      {isPartnerTyping && (
        <div className="absolute bottom-4 left-4 bg-black/45 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Stranger is typing...</span>
        </div>
      )}
    </div>
  );
}
