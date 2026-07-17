import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTC = (socket, roomId, partnerSocketId, isInitiator, onError) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const pendingOfferRef = useRef(null);
  const pendingAnswerRef = useRef(null);
  const remoteDescriptionSetRef = useRef(false);

  // Initialize Media Devices (Camera and Mic)
  const initLocalStream = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        return localStreamRef.current;
      }

      console.log('Requesting local media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      if (onError) {
        if (err.name === 'NotAllowedError') {
          onError('Camera and microphone permissions were denied. Please enable them to start chatting.');
        } else {
          onError('Could not access camera or microphone. Check connections.');
        }
      }
      throw err;
    }
  }, [onError]);

  // Clean up WebRTC peer connection and streams
  const cleanup = useCallback(() => {
    console.log('Cleaning up WebRTC resources...');
    
    // Stop screen sharing if active
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }

    // Stop local camera/mic stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Close PeerConnection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setRemoteStream(null);
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;
    pendingAnswerRef.current = null;
    remoteDescriptionSetRef.current = false;
  }, []);

  // Set up PeerConnection
  useEffect(() => {
    if (!socket || !roomId || !partnerSocketId) {
      return;
    }

    let isDestroyed = false;

    // Helper to add remote candidate safely
    const addRemoteCandidate = async (candidate) => {
      try {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding remote ICE candidate:', err);
      }
    };

    // Helper to process all buffered remote candidates
    const processPendingCandidates = async () => {
      if (!pcRef.current || !remoteDescriptionSetRef.current) return;
      console.log(`Processing ${pendingCandidatesRef.current.length} pending ICE candidates...`);
      while (pendingCandidatesRef.current.length > 0) {
        const candidate = pendingCandidatesRef.current.shift();
        await addRemoteCandidate(candidate);
      }
    };

    // Handler for remote offer
    const handleRemoteOffer = async (data) => {
      if (!pcRef.current) {
        console.log('Buffering remote offer (PeerConnection not initialized yet)...');
        pendingOfferRef.current = data;
        return;
      }
      try {
        console.log('Received remote offer, setting RemoteDescription...');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        remoteDescriptionSetRef.current = true;

        console.log('Creating SDP Answer...');
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        socket.emit('answer', {
          targetSocketId: partnerSocketId,
          answer,
        });

        await processPendingCandidates();
      } catch (err) {
        console.error('Error handling remote offer:', err);
      }
    };

    // Handler for remote answer
    const handleRemoteAnswer = async (data) => {
      if (!pcRef.current) {
        console.log('Buffering remote answer (PeerConnection not initialized yet)...');
        pendingAnswerRef.current = data;
        return;
      }
      try {
        console.log('Received remote answer, setting RemoteDescription...');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        remoteDescriptionSetRef.current = true;

        await processPendingCandidates();
      } catch (err) {
        console.error('Error handling remote answer:', err);
      }
    };

    // Handler for remote candidate
    const handleRemoteCandidate = async (data) => {
      if (!pcRef.current || !remoteDescriptionSetRef.current) {
        // console.log('Buffering remote candidate...');
        pendingCandidatesRef.current.push(data.candidate);
        return;
      }
      await addRemoteCandidate(data.candidate);
    };

    const setupPeerConnection = async () => {
      try {
        const stream = await initLocalStream();
        if (isDestroyed) return;

        console.log('Setting up PeerConnection...');
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Set remote stream event
        const rStream = new MediaStream();
        setRemoteStream(rStream);

        pc.ontrack = (event) => {
          console.log('Remote track received:', event.track.kind);
          if (event.streams && event.streams[0]) {
            setRemoteStream(new MediaStream(event.streams[0].getTracks()));
          } else {
            setRemoteStream((prev) => {
              const stream = prev || new MediaStream();
              if (!stream.getTracks().find((t) => t.id === event.track.id)) {
                stream.addTrack(event.track);
              }
              return new MediaStream(stream.getTracks());
            });
          }
        };

        // ICE Candidates exchange
        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit('iceCandidate', {
              targetSocketId: partnerSocketId,
              candidate: event.candidate,
            });
          }
        };

        // Connection state monitoring
        pc.onconnectionstatechange = () => {
          console.log(`WebRTC Connection State: ${pc.connectionState}`);
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            if (onError) onError('WebRTC connection to stranger lost. Please try matching again.');
          }
        };

        // Process any buffered offer/answer that arrived during initialization
        if (pendingOfferRef.current) {
          console.log('Processing buffered offer...');
          const bufferedOffer = pendingOfferRef.current;
          pendingOfferRef.current = null;
          await handleRemoteOffer(bufferedOffer);
        }

        if (pendingAnswerRef.current) {
          console.log('Processing buffered answer...');
          const bufferedAnswer = pendingAnswerRef.current;
          pendingAnswerRef.current = null;
          await handleRemoteAnswer(bufferedAnswer);
        }

        // If this peer is the initiator and no offer was buffered, create the SDP Offer
        if (isInitiator && !remoteDescriptionSetRef.current) {
          console.log('User is Initiator. Creating SDP Offer...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('offer', {
            targetSocketId: partnerSocketId,
            offer,
          });
        }
      } catch (err) {
        console.error('Failed to setup WebRTC connection:', err);
        if (onError) onError('Failed to establish peer-to-peer video connection.');
      }
    };

    // Bind event listeners immediately so we don't miss packets during media device initialization
    socket.on('offer', handleRemoteOffer);
    socket.on('answer', handleRemoteAnswer);
    socket.on('iceCandidate', handleRemoteCandidate);

    setupPeerConnection();

    return () => {
      isDestroyed = true;
      socket.off('offer', handleRemoteOffer);
      socket.off('answer', handleRemoteAnswer);
      socket.off('iceCandidate', handleRemoteCandidate);
      cleanup();
    };
  }, [socket, roomId, partnerSocketId, isInitiator, initLocalStream, cleanup, onError]);

  // Media Controls: Toggle Video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Media Controls: Toggle Audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Screen Sharing logic
  const toggleScreenShare = useCallback(async () => {
    if (!pcRef.current) return;

    if (isScreenSharing) {
      // Stop Screen Share
      console.log('Stopping screen share, returning to camera...');
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      // Re-enable camera track
      try {
        const cameraStream = await initLocalStream();
        const videoTrack = cameraStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
        setIsScreenSharing(false);
      } catch (err) {
        console.error('Error switching back to camera:', err);
      }
    } else {
      // Start Screen Share
      try {
        console.log('Starting screen sharing...');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false, // Don't share screen audio to prevent echoes
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track && s.track.kind === 'video');
        
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
          screenStreamRef.current = screenStream;
          setIsScreenSharing(true);

          // Handle user ending screen share via browser overlay bar
          screenTrack.onended = () => {
            toggleScreenShare(); // Revert back
          };
        }
      } catch (err) {
        console.error('Error starting screen sharing:', err);
        if (onError) onError('Could not share screen: ' + err.message);
      }
    }
  }, [isScreenSharing, initLocalStream, onError]);

  return {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    cleanup,
  };
};
