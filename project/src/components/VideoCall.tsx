import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface VideoCallProps {
  sessionId: string;
  isTeacher: boolean;
  participantName: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  sessionId, 
  isTeacher, 
  participantName, 
  onEndCall 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Initialize peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    peerConnectionRef.current = peerConnection;

    // Get user media
    navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    }).then(stream => {
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
    }).catch(error => {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('Camera/Microphone access denied');
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setConnectionStatus('Connected');
      setIsConnected(true);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit('ice-candidate', {
          sessionId,
          candidate: event.candidate
        });
      }
    };

    // Socket event handlers
    newSocket.on('user-joined', () => {
      setConnectionStatus('User joined, establishing connection...');
      if (isTeacher) {
        createOffer();
      }
    });

    newSocket.on('offer', async (data) => {
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      newSocket.emit('answer', { sessionId, answer });
    });

    newSocket.on('answer', async (data) => {
      await peerConnection.setRemoteDescription(data.answer);
    });

    newSocket.on('ice-candidate', async (data) => {
      await peerConnection.addIceCandidate(data.candidate);
    });

    // Join session room
    newSocket.emit('join-session', sessionId);

    const createOffer = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      newSocket.emit('offer', { sessionId, offer });
    };

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peerConnection.close();
      newSocket.disconnect();
    };
  }, [sessionId, isTeacher]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socket) {
      socket.disconnect();
    }
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-white text-xl font-bold">
            🦇 Wayne Tech Learning Session
          </h2>
          <p className="text-gray-300">
            {isTeacher ? 'Teaching' : 'Learning with'} {participantName}
          </p>
        </div>
        <div className="text-yellow-400">
          Status: {connectionStatus}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gray-800">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden border-2 border-yellow-400">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Connection Status Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center text-white">
              <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-xl">{connectionStatus}</p>
              <p className="text-gray-300 mt-2">Preparing your Batman learning session...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${
            isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white transition-colors`}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white transition-colors`}
        >
          {isVideoOff ? '📹' : '📷'}
        </button>
        
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          📞 End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;