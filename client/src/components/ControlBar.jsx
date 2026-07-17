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
}) {
  return (
    <div className="w-full bg-white border border-slate-100 shadow-premium rounded-2xl px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
      {/* Media Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Toggle Audio */}
        <button
          onClick={toggleAudio}
          title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          className={`p-2 sm:p-3 rounded-xl transition duration-150 ${
            isAudioEnabled
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          {isAudioEnabled ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          className={`p-2 sm:p-3 rounded-xl transition duration-150 ${
            isVideoEnabled
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          {isVideoEnabled ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          className={`p-2 sm:p-3 rounded-xl transition duration-150 ${
            isScreenSharing
              ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        {/* Next Stranger */}
        <button
          onClick={onNext}
          title="Match with Next Stranger"
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs sm:text-sm rounded-xl transition duration-150 shadow-md shadow-brand-100 hover:shadow-lg"
        >
          <span className="hidden xs:inline sm:inline">Next Stranger</span>
          <span className="xs:hidden">Next</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Leave Room */}
        <button
          onClick={onLeave}
          title="Leave Chat Room"
          className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-semibold text-xs sm:text-sm rounded-xl transition duration-150"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Display Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Fullscreen Video */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className={`p-2 sm:p-3 rounded-xl transition duration-150 bg-slate-100 text-slate-700 hover:bg-slate-200`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Chat Toggle */}
        <button
          onClick={toggleChat}
          title={isChatOpen ? 'Hide Chat Panel' : 'Show Chat Panel'}
          className={`p-2 sm:p-3 rounded-xl transition duration-150 ${
            isChatOpen
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
          }`}
        >
          {isChatOpen ? <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> : <MessageSquareOff className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>
    </div>
  );
}
