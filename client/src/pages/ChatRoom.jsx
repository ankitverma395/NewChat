import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoPlayer from '../components/VideoPlayer';
import ControlBar from '../components/ControlBar';
import ChatBox from '../components/ChatBox';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function ChatRoom() {
  const {
    socket,
    roomId,
    partnerSocketId,
    isInitiator,
    messages,
    matchState,
    strangerIsTyping,
    error,
    setError,
    sendMessage,
    sendTypingStatus,
    leaveChat,
    nextStranger,
    joinChatQueue,
  } = useChat();

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef(null);

  // Initialize WebRTC
  const {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  } = useWebRTC(socket, roomId, partnerSocketId, isInitiator, setError);

  // Auto-reconnect flow when stranger disconnects
  useEffect(() => {
    if (matchState === 'disconnected') {
      const timer = setTimeout(() => {
        console.log('Stranger left. Automatically re-entering queue...');
        joinChatQueue();
      }, 4000); // 4 seconds delay to read the message

      return () => clearTimeout(timer);
    }
  }, [matchState, joinChatQueue]);

  // Handle browser HTML5 Fullscreen API
  const handleToggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error('Error entering fullscreen:', err);
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen change with ESC key or user browser exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 py-2 sm:py-6">
      {/* Error alert drawer */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold shadow-inner-soft">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main split chat zone */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 mb-4 sm:mb-6">
        
        {/* Video Player component */}
        <VideoPlayer
          localStream={localStream}
          remoteStream={remoteStream}
          isVideoEnabled={isVideoEnabled}
          strangerIsTyping={strangerIsTyping}
          matchState={matchState}
          videoContainerRef={videoContainerRef}
          isChatOpen={isChatOpen}
        />

        {/* Text chat panel column */}
        {isChatOpen && (
          <div className="flex-1 lg:col-span-4 h-full min-h-0 flex flex-col mt-2 lg:mt-0">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              onSendTypingStatus={sendTypingStatus}
              strangerIsTyping={strangerIsTyping}
            />
          </div>
        )}
      </div>

      {/* Controls at the bottom */}
      <ControlBar
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        isFullscreen={isFullscreen}
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
        toggleScreenShare={toggleScreenShare}
        toggleChat={() => setIsChatOpen(!isChatOpen)}
        toggleFullscreen={handleToggleFullscreen}
        onNext={nextStranger}
        onLeave={leaveChat}
      />
    </div>
  );
}
