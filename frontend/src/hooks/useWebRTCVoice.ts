'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export interface VoicePeer {
  socketId: string;
  userId: string;
  userName: string;
  isMuted: boolean;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTCVoice(socket: Socket | null, shopId: string) {
  const [peers, setPeers] = useState<VoicePeer[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isInVoice, setIsInVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // ขอสิทธิ์ไมโครโฟน
  const startLocalAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      return stream;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError' 
        ? 'กรุณาอนุญาตให้ใช้งานไมโครโฟนเพื่อพูดคุยในร้านค้า' 
        : 'ไม่พบอุปกรณ์ไมโครโฟนบนอุปกรณ์ของคุณ';
      setVoiceError(msg);
      throw new Error(msg);
    }
  };

  // สร้าง RTCPeerConnection
  const createPeerConnection = (targetSocketId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // ใส่ track เสียงของตัวเองเข้าไป
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // เมื่อมี Remote Track เข้ามา ให้เล่นเสียง
    pc.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch((e) => console.log('Autoplay audio blocked:', e));
    };

    // แลกเปลี่ยน ICE Candidate
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('voice:ice_candidate', {
          toSocketId: targetSocketId,
          signal: event.candidate,
        });
      }
    };

    peerConnections.current.set(targetSocketId, pc);
    return pc;
  };

  // เข้าร่วมห้องเสียง
  const joinVoice = async () => {
    if (!socket || !shopId) return;

    try {
      setVoiceError(null);
      const stream = await startLocalAudio();
      setIsInVoice(true);

      // ส่งคำขอเข้าห้องเสียงหน้าร้าน
      socket.emit('voice:join', { shopId });

      // 1. รับรายชื่อคนที่อยู่ในห้องก่อนแล้ว -> เราเริ่มส่ง Offer หาพวกเขา
      socket.on('voice:peers_in_room', async (data: { peers: VoicePeer[]; myPeer: VoicePeer }) => {
        setPeers(data.peers);

        for (const peer of data.peers) {
          const pc = createPeerConnection(peer.socketId, stream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('voice:offer', {
            toSocketId: peer.socketId,
            signal: offer,
          });
        }
      });

      // 2. คนใหม่เข้ามา
      socket.on('voice:user_joined', (newPeer: VoicePeer) => {
        setPeers((prev) => [...prev, newPeer]);
      });

      // 3. ได้รับ Offer จากคนใหม่ -> ส่ง Answer กลับ
      socket.on('voice:offer', async (data: { fromSocketId: string; signal: any }) => {
        const pc = createPeerConnection(data.fromSocketId, stream);
        await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('voice:answer', {
          toSocketId: data.fromSocketId,
          signal: answer,
        });
      });

      // 4. ได้รับ Answer
      socket.on('voice:answer', async (data: { fromSocketId: string; signal: any }) => {
        const pc = peerConnections.current.get(data.fromSocketId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
        }
      });

      // 5. ได้รับ ICE Candidate
      socket.on('voice:ice_candidate', async (data: { fromSocketId: string; signal: any }) => {
        const pc = peerConnections.current.get(data.fromSocketId);
        if (pc && data.signal) {
          await pc.addIceCandidate(new RTCIceCandidate(data.signal));
        }
      });

      // 6. มีคนออกจากห้องเสียง
      socket.on('voice:user_left', (data: { socketId: string }) => {
        const pc = peerConnections.current.get(data.socketId);
        if (pc) {
          pc.close();
          peerConnections.current.delete(data.socketId);
        }
        setPeers((prev) => prev.filter((p) => p.socketId !== data.socketId));
      });

    } catch (err: any) {
      console.error('Failed to join voice:', err);
    }
  };

  // ออกจากห้องเสียง
  const leaveVoice = useCallback(() => {
    if (socket) {
      socket.emit('voice:leave');
      socket.off('voice:peers_in_room');
      socket.off('voice:user_joined');
      socket.off('voice:offer');
      socket.off('voice:answer');
      socket.off('voice:ice_candidate');
      socket.off('voice:user_left');
    }

    // ปิดแทร็กไมค์ทั้งหมด
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // ปิด peer connections ทั้งหมด
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    setIsInVoice(false);
    setPeers([]);
  }, [socket]);

  // สลับ Mute / Unmute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsMuted(newMuted);

        if (socket) {
          socket.emit('voice:mute_change', { roomId: shopId, isMuted: newMuted });
        }
      }
    }
  }, [socket, shopId]);

  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  return {
    isInVoice,
    isMuted,
    peers,
    voiceError,
    joinVoice,
    leaveVoice,
    toggleMute,
  };
}
