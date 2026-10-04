'use client';

import React from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTCVoice } from '../../hooks/useWebRTCVoice';
import { Mic, MicOff, PhoneOff, AlertCircle } from 'lucide-react';

interface VoiceProps {
  shopId: string;
  userId: string;
  userName: string;
  token?: string;
}

export default function VoiceControlWidget({
  shopId,
  userId,
  userName,
  token,
}: VoiceProps) {
  const { socket, isConnected } = useSocket(token, { userId, userName });

  const {
    isInVoice,
    isMuted,
    peers,
    voiceError,
    joinVoice,
    leaveVoice,
    toggleMute,
  } = useWebRTCVoice(socket, shopId);

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white font-sans">
      {voiceError && (
        <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{voiceError}</span>
        </div>
      )}

      {!isInVoice ? (
        <button
          onClick={joinVoice}
          disabled={!isConnected}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Mic className="w-4 h-4" /> เข้าร่วมสนทนาด้วยเสียง
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
                isMuted ? 'bg-rose-600/20 text-rose-400' : 'bg-emerald-600/20 text-emerald-400'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'ปิดไมค์อยู่' : 'เปิดไมค์อยู่'}
            </button>
            <button
              onClick={leaveVoice}
              className="p-2 rounded-xl bg-slate-800 text-rose-400 text-xs"
              title="ออกจากห้องเสียง"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400">
            <span>สมาชิกในห้อง ({peers.length + 1} คน)</span>
          </div>
        </div>
      )}
    </div>
  );
}
