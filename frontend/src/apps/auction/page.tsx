'use client';

import React, { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuction } from '../../hooks/useAuction';
import { Gavel, Clock, Flame, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';

interface AuctionPageProps {
  auctionId?: string;
  token?: string;
}

export default function AuctionPage({ auctionId = '', token }: AuctionPageProps) {
  const [customBid, setCustomBid] = useState<string>('');

  const { socket, isConnected } = useSocket(token);
  const {
    auction,
    history,
    timeLeft,
    isExtended,
    extensionMessage,
    bidError,
    placeBid,
  } = useAuction(socket, auctionId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickBid = (increment: number) => {
    if (!auction) return;
    const base = auction.currentBid || auction.startPrice || 0;
    placeBid(base + increment);
  };

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customBid);
    if (!isNaN(amount) && amount > 0) {
      placeBid(amount);
      setCustomBid('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> ระบบประมูล (Auction)
            </span>
            <div className="flex items-center gap-1.5 ml-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <span className="text-slate-400">{isConnected ? 'เชื่อมต่อแล้ว' : 'รอการเชื่อมต่อ...'}</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {auction?.title || 'ห้องประมูล'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Info */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
            {auction?.imageUrl ? (
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-80 md:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-80 md:h-96 flex items-center justify-center text-slate-600">
                ไม่มีรูปภาพสินค้า
              </div>
            )}
            <div className="p-4 bg-slate-900">
              <h2 className="text-lg font-bold text-white mb-1">{auction?.title}</h2>
              <p className="text-sm text-slate-400">{auction?.description}</p>
            </div>
          </div>

          {/* Anti-snipe Banner */}
          {isExtended && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-300">ระบบต่อเวลาอัตโนมัติ (Anti-Sniping)</h4>
                <p className="text-xs text-amber-200/80">{extensionMessage}</p>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Controls & History */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Countdown Timer */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-indigo-400" /> เวลาที่เหลือ
            </span>
            <div className="text-4xl md:text-5xl font-mono font-bold text-white">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Current Bid */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">ราคาสูงสุดในปัจจุบัน</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-white">
                {auction?.currentBid ? auction.currentBid.toLocaleString() : '0'}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ผู้เสนอราคาสูงสุด:</span>
              <span className="text-slate-200 font-medium">
                {auction?.highestBidderName || '-'}
              </span>
            </div>
          </div>

          {/* Bidding Controls */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" /> เสนอราคา
            </h3>

            {/* Quick Bid */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickBid(auction?.minBidStep || 100)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                +{(auction?.minBidStep || 100).toLocaleString()}
              </button>
              <button
                type="button"
                onClick={() => handleQuickBid(500)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                +500
              </button>
              <button
                type="button"
                onClick={() => handleQuickBid(1000)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                +1,000
              </button>
            </div>

            {/* Custom Bid */}
            <form onSubmit={handleCustomBidSubmit} className="flex gap-2">
              <input
                type="number"
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value)}
                placeholder="ระบุราคาที่ต้องการ"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                เสนอราคา <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {bidError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {bidError}
              </div>
            )}
          </div>

          {/* Bid History */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">ประวัติการเสนอราคา</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-xs text-slate-600 text-center py-4">ยังไม่มีประวัติการเสนอราคา</div>
              ) : (
                history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 text-xs"
                  >
                    <span className="text-slate-400">{record.bidderName}</span>
                    <span className="text-slate-200 font-medium">{record.bidAmount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
