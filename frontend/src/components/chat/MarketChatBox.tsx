'use client';

import React, { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useMarketChat } from '../../hooks/useMarketChat';
import { Send, Store, AlertCircle, X, ShieldCheck } from 'lucide-react';

export interface MarketChatBoxProps {
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  currentUserId: string;
  currentUserName: string;
  isSellerOpen?: boolean;
  onClose?: () => void;
}

export default function MarketChatBox({
  sellerId,
  sellerName,
  buyerId,
  buyerName,
  currentUserId,
  currentUserName,
  isSellerOpen = true,
  onClose,
}: MarketChatBoxProps) {
  const [inputText, setInputText] = useState('');

  // 1. เชื่อมต่อ Socket เข้า Backend Server (พอร์ต 5000)
  const { socket, isConnected } = useSocket();

  // 2. เรียกใช้ Hook useMarketChat
  const {
    messages,
    isJoined,
    error,
    isPeerTyping,
    sendMessage,
    sendTyping,
    clearError,
  } = useMarketChat(socket, {
    sellerId,
    buyerId,
    currentUserId,
    currentUserName,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText);
    setInputText('');
    sendTyping(false);
  };

  const isSeller = currentUserId === sellerId;
  const chatPartnerName = isSeller ? buyerName : sellerName;

  return (
    <div className="flex flex-col h-[520px] w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{chatPartnerName}</h3>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {isSellerOpen ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> เปิดร้านในตลาดเสมือน
                </span>
              ) : (
                <span className="text-rose-400">● ปิดร้านชั่วคราว</span>
              )}
              <span>• กำลังคุยในฐานะ: <b className="text-indigo-300">{currentUserName}</b></span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error.message}</span>
          </div>
          <button onClick={clearError} className="text-rose-400 hover:text-white text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60">
        {!isJoined && isConnected && (
          <div className="text-center text-xs text-slate-500 py-4">กำลังเข้าห้องแชท...</div>
        )}

        {messages.length === 0 && isJoined ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6">
            <Store className="w-10 h-10 mb-2 opacity-20 text-indigo-400" />
            <p>เริ่มพิมพ์ข้อความเพื่อพูดคุยในตลาดเสมือนได้ทันที</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                  {isMe ? 'คุณ' : msg.senderName}
                </span>
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs break-words shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {/* Peer Typing Indicator */}
        {isPeerTyping && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 text-[11px]">{chatPartnerName} กำลังพิมพ์...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          disabled={!isSellerOpen || !isConnected}
          value={inputText}
          onChange={handleInputChange}
          placeholder={
            !isConnected
              ? 'รอการเชื่อมต่อ Socket Server...'
              : !isSellerOpen
              ? 'ผู้ขายปิดร้านชั่วคราว ไม่สามารถส่งข้อความได้'
              : 'พิมพ์ข้อความ (สูงสุด 1,000 อักษร)...'
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={!isSellerOpen || !inputText.trim() || !isConnected}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition flex items-center justify-center shadow-lg shadow-indigo-600/30"
          title="ส่งข้อความ"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
