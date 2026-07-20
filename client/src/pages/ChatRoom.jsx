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
    chatMode,
    interests,
    partnerInterests,
    commonInterests,
    partnerNickname,
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
    connectionStats,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  } = useWebRTC(socket, roomId, partnerSocketId, isInitiator, setError, chatMode === 'video');

  // Handle Snapshot Capture from live video elements
  const handleTakeSnapshot = () => {
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');

    if (!remoteVideo) {
      setError('Snapshot failed: Stranger video stream is not active.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      // 1. Draw Remote Video as background (full screen)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      try {
        ctx.drawImage(remoteVideo, 0, 0, 1280, 720);
      } catch (err) {
        console.warn('Could not draw remote video feed:', err);
      }

      // 2. Draw Local Video overlay in bottom-right corner if local video is enabled
      if (localVideo && isVideoEnabled && localStream) {
        const overlayWidth = 320;
        const overlayHeight = 240;
        const padding = 40;
        const rightEdge = 1280 - padding;
        const bottomEdge = 720 - padding;

        // Container border/shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(rightEdge - overlayWidth - 6, bottomEdge - overlayHeight - 6, overlayWidth + 12, overlayHeight + 12);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(rightEdge - overlayWidth - 4, bottomEdge - overlayHeight - 4, overlayWidth + 8, overlayHeight + 8);

        // Draw local video mirrored to match user preview
        ctx.save();
        ctx.scale(-1, 1);
        try {
          ctx.drawImage(localVideo, -rightEdge, bottomEdge - overlayHeight, overlayWidth, overlayHeight);
        } catch (err) {
          console.warn('Could not draw local video feed:', err);
        }
        ctx.restore();
      }

      // 3. Draw Branding Watermark at top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fillRect(40, 40, 340, 75);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 40, 340, 75);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('StrangerChat', 60, 72);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '500 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      const dateStr = new Date().toLocaleString([], { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
      ctx.fillText(`Match Moment • ${dateStr}`, 60, 94);

      // 4. Download Snapshot
      const image = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = image;
      link.download = `strangerchat_moment_${Date.now()}.jpg`;
      link.click();
    } catch (err) {
      console.error('Snapshot error:', err);
      setError('Failed to capture snapshot. Browser security restrictions may apply.');
    }
  };

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
          chatMode={chatMode}
          interests={interests}
          partnerInterests={partnerInterests}
          commonInterests={commonInterests}
          partnerNickname={partnerNickname}
          connectionStats={connectionStats}
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
        chatMode={chatMode}
        onTakeSnapshot={handleTakeSnapshot}
      />
    </div>
  );
}
