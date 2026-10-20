'use client';

import React, { useState, useMemo } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuction } from '../../hooks/useAuction';
import {
  Gavel,
  Clock,
  Flame,
  ShieldAlert,
  Trophy,
  ArrowUpRight,
  Sparkles,
  RotateCcw,
  Timer,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AuctionViewProps {
  auctionId: string;
  userId: string;
  userName: string;
  clientBadge?: string;
  badgeColor?: 'indigo' | 'amber' | 'emerald';
  compact?: boolean;
}

export default function AuctionView({
  auctionId,
  userId,
  userName,
  clientBadge,
  badgeColor = 'indigo',
  compact = false,
}: AuctionViewProps) {
  const [customBidInput, setCustomBidInput] = useState<string>('');

  // แต่ละหน้าจอสามารถจำลองผู้ใช้ที่เป็นเอกเทศผ่าน query params
  const userQuery = useMemo(() => ({ userId, userName }), [userId, userName]);
  const { socket, isConnected } = useSocket(undefined, userQuery);

  const {
    auction,
    history,
    timeLeft,
    isExtended,
    extensionMessage,
    bidError,
    isSettling,
    isEnded,
    winner,
    finalBid,
    isSubmitting,
    isHighestBidder,
    placeBid,
    quickBid,
    devReset,
    devSetTimer,
  } = useAuction(socket, auctionId, userId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const minNextBid = useMemo(() => {
    if (!auction) return 0;
    if (auction.highestBidder) {
      return auction.currentBid + auction.minBidStep;
    }
    return auction.startPrice;
  }, [auction]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customBidInput);
    if (!isNaN(amount) && amount > 0) {
      placeBid(amount);
      setCustomBidInput('');
    }
  };

  // ตรวจสอบว่าผู้ใช้นี้เคยเคาะราคาไปแล้วหรือไม่
  const hasUserBidded = useMemo(() => {
    return history.some((h) => h.bidderId === userId);
  }, [history, userId]);

  const isUserOutbid = hasUserBidded && !isHighestBidder && !isEnded;

  const badgeStyles = {
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }[badgeColor];

  const isAntiSnipeZone = timeLeft > 0 && timeLeft <= (auction?.antiSnipeSeconds || 120);

  return (
    <div className="w-full flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Client Identity Header */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles}`}>
            {clientBadge || userName}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            (ID: {userId.substring(0, 8)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'
            }`}
          />
          <span className="text-[11px] text-slate-400">
            {isConnected ? 'เชื่อมต่อสด' : 'กำลังเชื่อมต่อ...'}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Anti-snipe Banner Alert */}
        {isExtended && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-200 flex items-start gap-3 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="block font-bold text-amber-300">
                ⚡ ตรวจพบการเคาะราคาช่วงท้าย (Anti-Snipe Activated!)
              </strong>
              <span>{extensionMessage || 'ระบบรีเซ็ตเวลาสิ้นสุดเป็น 2 นาที เพื่อความเป็นธรรม'}</span>
            </div>
          </div>
        )}

        {/* Status Banners: Settling or Ended */}
        {isSettling && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0 animate-spin" />
            <div className="text-xs">
              <strong className="block font-bold text-indigo-300">🔒 ปิดรับการประมูลแล้ว</strong>
              <span>กำลังยืนยันผู้ชนะและตัดเงิน Escrow Settlement...</span>
            </div>
          </div>
        )}

        {isEnded && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center gap-3.5">
            <Trophy className="w-6 h-6 text-yellow-400 shrink-0 animate-bounce" />
            <div className="text-xs">
              <strong className="block font-bold text-yellow-300 text-sm">
                🏆 จบการประมูลแล้วอย่างเป็นทางการ!
              </strong>
              <span>
                ผู้ชนะ: <strong className="text-white">{winner?.userName || 'ไม่มีผู้เสนอราคา'}</strong> | ยอดปิดประมูล: <strong className="text-amber-300">{finalBid?.toLocaleString() || '-'} บาท</strong>
              </span>
            </div>
          </div>
        )}

        {/* Product Visual Card */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 group">
          <div className="w-full h-48 sm:h-56 overflow-hidden relative">
            <img
              src={auction?.imageUrl || '/assets/legendary_sword.jpg'}
              alt={auction?.title || 'ไอเทมประมูล'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Top Product Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/90 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3 fill-slate-950" /> Weekly Rare
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-black/60 text-slate-300 backdrop-blur-md border border-white/10">
                ขั้นต่ำ +{auction?.minBidStep || 100} ฿
              </span>
            </div>

            {/* User State Pill overlaying image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              {isHighestBidder ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> คุณกำลังเป็นผู้นำราคา!
                </span>
              ) : isUserOutbid ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white flex items-center gap-1.5 shadow-lg shadow-rose-500/20 animate-bounce">
                  <AlertCircle className="w-3.5 h-3.5" /> คุณถูกแซงราคาแล้ว!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 backdrop-blur-md">
                  ยังไม่ได้ร่วมเคาะราคา
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950">
            <h3 className="text-base font-bold text-white tracking-tight">
              {auction?.title || 'ดาบมังกรไฟโบราณ (Legendary Fire Sword)'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {auction?.description || 'ไอเทมแรร์ระดับตำนานประจำสัปดาห์'}
            </p>
          </div>
        </div>

        {/* Live Metrics: Countdown & Current Bid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Countdown Clock */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isAntiSnipeZone
                ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${isAntiSnipeZone ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
                เวลาที่เหลือ
              </span>
              {isAntiSnipeZone && (
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider animate-pulse">
                  Anti-Snipe
                </span>
              )}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
                isAntiSnipeZone ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Current Highest Bid */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              ราคาสูงสุดในปัจจุบัน
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400">
              {auction?.currentBid ? auction.currentBid.toLocaleString() : '1,000'}{' '}
              <span className="text-xs font-sans text-amber-300 font-normal">บาท</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 truncate">
              โดย:{' '}
              <span className="text-slate-200 font-medium">
                {auction?.highestBidder?.userName || 'ยังไม่มีผู้เสนอ'}
              </span>
            </div>
          </div>
        </div>

        {/* Bidding Control Panel */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-amber-400" /> แผงเสนอราคา
            </span>
            <span className="text-[11px] text-slate-400">
              เสนอขั้นต่ำ:{' '}
              <strong className="text-indigo-400 font-mono">
                {minNextBid.toLocaleString()} ฿
              </strong>
            </span>
          </div>

          {/* Quick Increment Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((inc) => {
              const targetPrice = (auction?.currentBid || auction?.startPrice || 0) + inc;
              return (
                <button
                  key={inc}
                  type="button"
                  disabled={isSubmitting || isSettling || isEnded || isHighestBidder}
                  onClick={() => quickBid(inc)}
                  className={`py-2 px-2 rounded-xl text-center transition flex flex-col items-center justify-center border ${
                    isHighestBidder
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200 active:scale-95'
                  }`}
                >
                  <span className="text-xs font-bold text-indigo-300">+{inc.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({targetPrice.toLocaleString()} ฿)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Bid Input */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="number"
              min={minNextBid}
              step={auction?.minBidStep || 100}
              disabled={isSubmitting || isSettling || isEnded || isHighestBidder}
              value={customBidInput}
              onChange={(e) => setCustomBidInput(e.target.value)}
              placeholder={`ระบุราคา (ขั้นต่ำ ${minNextBid.toLocaleString()})`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting || isSettling || isEnded || isHighestBidder || !customBidInput}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                isHighestBidder || isSubmitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <span>กำลังส่ง...</span>
              ) : isHighestBidder ? (
                <span>คุณนำอยู่</span>
              ) : (
                <>
                  <span>เคาะ</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {bidError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{bidError}</span>
            </div>
          )}
        </div>

        {/* Live Bid History Feed */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ประวัติการเสนอราคาสด
            </span>
            <span className="text-[10px] text-slate-500">{history.length} รายการ</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-5 text-xs text-slate-600">
                ยังไม่มีการเคาะราคา เป็นคนแรกที่เริ่มเลย!
              </div>
            ) : (
              history.map((record, index) => {
                const isThisClient = record.bidderId === userId;
                return (
                  <div
                    key={record.id || index}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition border ${
                      index === 0
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : isThisClient
                        ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {record.bidderName}
                        {isThisClient && (
                          <span className="ml-1 text-[10px] text-indigo-400 font-normal">
                            (คุณ)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">
                        {record.bidAmount.toLocaleString()} ฿
                      </span>
                      {index === 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950">
                          สูงสุด
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Developer / Demo Simulator Controls */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
            <span>⚙️ เครื่องมือทดสอบสถานะ (Dev Simulation)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => devSetTimer(30)}
              className="py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center justify-center gap-1 transition"
              title="ตั้งเวลาเหลือ 30 วินาทีเพื่อทดสอบ Anti-Snipe (เมื่อเคาะจะรีเซ็ตกลับเป็น 120s)"
            >
              <Timer className="w-3 h-3 text-amber-400" /> เหลือ 30s
            </button>
            <button
              type="button"
              onClick={() => devSetTimer(5)}
              className="py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center justify-center gap-1 transition"
              title="ตั้งเวลาเหลือ 5 วินาทีเพื่อดูการตัดยอด Settlement และประกาศผู้ชนะ"
            >
              <Lock className="w-3 h-3 text-rose-400" /> เหลือ 5s
            </button>
            <button
              type="button"
              onClick={devReset}
              className="py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center justify-center gap-1 transition"
              title="รีเซ็ตห้องประมูลกลับสู่สถานะเริ่มต้น 10 นาที"
            >
              <RotateCcw className="w-3 h-3 text-indigo-400" /> รีเซ็ตห้อง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
