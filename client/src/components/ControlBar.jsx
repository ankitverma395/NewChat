import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  ArrowRight,
  LogOut,
  Maximize2,
  Minimize2,
  MessageSquare,
  MessageSquareOff,
  Camera,
} from 'lucide-react';

export default function ControlBar({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isChatOpen,
  isFullscreen,
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  toggleChat,
  toggleFullscreen,
  onNext,
  onLeave,
  chatMode = 'video',
  onTakeSnapshot,
}) {
  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 shadow-2xl backdrop-blur-2xl rounded-3xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 z-10">
      {/* Media Controls */}
      {chatMode === 'video' ? (
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Toggle Audio */}
          <button
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer ${
              isAudioEnabled
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <MicOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer ${
              isVideoEnabled
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isVideoEnabled ? <Video className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <VideoOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer ${
              isScreenSharing
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Monitor className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center text-slate-400 text-[10px] sm:text-xs font-semibold bg-slate-950/60 border border-slate-800 px-3 py-2.5 rounded-2xl">
          🎙️ Media disabled (Text Mode)
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3.5">
        {/* Next Stranger */}
        <button
          onClick={onNext}
          title="Match with Next Stranger"
          className="flex items-center space-x-1.5 sm:space-x-2.5 px-4 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 active:scale-[0.97] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition duration-150 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 cursor-pointer"
        >
          <span className="hidden sm:inline">Next Stranger</span>
          <span className="sm:hidden">Next</span>
          <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Leave Room */}
        <button
          onClick={onLeave}
          title="Leave Chat Room"
          className="flex items-center space-x-1 sm:space-x-1.5 px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-900/80 hover:bg-red-500/10 hover:text-red-400 text-slate-400 hover:border-red-500/25 border border-slate-800 font-bold text-xs sm:text-sm rounded-2xl transition duration-150 active:scale-[0.97] cursor-pointer"
        >
          <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Display Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Take Snapshot */}
        {chatMode === 'video' && onTakeSnapshot && (
          <button
            onClick={onTakeSnapshot}
            title="Take Video Snapshot"
            className="p-2.5 sm:p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-blue-400 active:scale-95 transition cursor-pointer"
          >
            <Camera className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Fullscreen Video */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 sm:p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
        </button>

        {/* Chat Toggle */}
        <button
          onClick={toggleChat}
          title={isChatOpen ? 'Hide Chat Panel' : 'Show Chat Panel'}
          className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 cursor-pointer ${
            isChatOpen
              ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
          }`}
        >
          {isChatOpen ? <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <MessageSquareOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
        </button>
      </div>
    </div>
  );
}
