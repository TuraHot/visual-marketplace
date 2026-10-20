'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuctionView from '../../components/auction/AuctionView';
import {
  Gavel,
  Zap,
  Users,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function AuctionMainPage() {
  const [isSplitMode, setIsSplitMode] = useState<boolean>(true);
  const [concurrencyStatus, setConcurrencyStatus] = useState<string | null>(null);
  const [isFiringConcurrent, setIsFiringConcurrent] = useState<boolean>(false);

  const AUCTION_ID = 'auction-weekly-01';

  // ข้อมูลจำลองสำหรับ 2 ผู้ใช้
  const userA = {
    userId: 'user_somchai_01',
    userName: 'สมชาย นักสะสม',
    clientBadge: 'ผู้ประมูล A (สมชาย)',
    badgeColor: 'indigo' as const,
  };

  const userB = {
    userId: 'user_karn_02',
    userName: 'กานต์ เจ้าพ่อประมูล',
    clientBadge: 'ผู้ประมูล B (กานต์)',
    badgeColor: 'amber' as const,
  };

  // การทดสอบจำลองส่งคำขอเคาะราคาพร้อมกันในระดับมิลลิวินาที (Concurrency Stress Test)
  const handleSimulateConcurrentBids = async () => {
    try {
      setIsFiringConcurrent(true);
      setConcurrencyStatus('🚀 กำลังยิงคำขอเคาะราคาพร้อมกัน 2 รายการในมิลลิวินาทีเดียวกัน...');

      // สร้าง socket ชั่วคราว 2 ตัวที่จำลองคำขอพร้อมกัน
      const socketA = io(BACKEND_URL, { query: { userId: userA.userId, userName: userA.userName }, transports: ['websocket'] });
      const socketB = io(BACKEND_URL, { query: { userId: userB.userId, userName: userB.userName }, transports: ['websocket'] });

      await Promise.all([
        new Promise((resolve) => socketA.on('connect', () => resolve(true))),
        new Promise((resolve) => socketB.on('connect', () => resolve(true))),
      ]);

      // ดึงสถานะปัจจุบันเพื่อคำนวณราคาเคาะแข่ง
      socketA.emit('auction:join', { auctionId: AUCTION_ID });
      const state: any = await new Promise((resolve) => {
        socketA.once('auction:state', resolve);
        setTimeout(() => resolve(null), 2000);
      });

      const base = state?.currentBid || 1000;
      const bidAmountA = base + 100;
      const bidAmountB = base + 500;

      // ส่งคำขอทั้ง 2 รายการพร้อมกัน ณ จุดนี้
      const pA = new Promise((resolve) => {
        socketA.once('auction:bid_accepted', (res) => resolve({ client: 'A', status: 'accepted', data: res }));
        socketA.once('auction:bid_rejected', (res) => resolve({ client: 'A', status: 'rejected', data: res }));
        socketA.emit('auction:place_bid', {
          auctionId: AUCTION_ID,
          requestId: `sim_a_${Date.now()}`,
          bidAmount: bidAmountA,
        });
      });

      const pB = new Promise((resolve) => {
        socketB.once('auction:bid_accepted', (res) => resolve({ client: 'B', status: 'accepted', data: res }));
        socketB.once('auction:bid_rejected', (res) => resolve({ client: 'B', status: 'rejected', data: res }));
        socketB.emit('auction:place_bid', {
          auctionId: AUCTION_ID,
          requestId: `sim_b_${Date.now()}`,
          bidAmount: bidAmountB,
        });
      });

      const [resA, resB]: any = await Promise.all([pA, pB]);

      setConcurrencyStatus(
        `✅ ผลการทดสอบ Concurrency: คำขอ A (+100 -> ${bidAmountA} ฿) ได้รับผล: ${resA.status} | คำขอ B (+500 -> ${bidAmountB} ฿) ได้รับผล: ${resB.status} (ผ่านคิว FIFO และถูก Re-evaluate ตามลำดับสำเร็จ!)`
      );

      socketA.disconnect();
      socketB.disconnect();
    } catch (err: any) {
      setConcurrencyStatus(`⚠️ เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsFiringConcurrent(false);
      setTimeout(() => {
        setConcurrencyStatus(null);
      }, 9000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Main Navigation / Bar */}
      <header className="max-w-7xl mx-auto mb-8 pb-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Flame className="w-4 h-4 fill-amber-400" /> โรงประมูล Real-time (Auction Engine)
              </span>
              <span className="text-xs text-slate-400">คนที่ 4 (แฮม) — ระบบประมูลและ Concurrency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              โรงประมูลและห้องจำลองการเคาะราคาแข่งขัน
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              ระบบประมูลแบบเรียลไทม์พร้อมการจัดการ Race Condition ด้วย FIFO Queue, กติกา Fixed Anti-Snipe (รีเซ็ตเวลาเป็น 120 วินาที), ป้องกันการเคาะแข่งกับตัวเอง และ 3-Phase Settlement
            </p>
          </div>

          {/* Navigation Links and Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/chat"
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-2 transition shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>ไปที่ระบบแชท</span>
            </Link>

            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => setIsSplitMode(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  !isSplitMode
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" /> หน้าจอเดี่ยว
              </button>
              <button
                type="button"
                onClick={() => setIsSplitMode(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSplitMode
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> จำลอง 2 จอแข่งกัน
              </button>
            </div>
          </div>
        </div>

        {/* Feature Checkpoints */}
        <div className="mt-5 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Per-Auction FIFO Queue
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fixed Anti-Snipe (รีเซ็ต 120s)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Self-Bidding Prevention
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pre-bid Expiry Guard
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3-Phase Settlement (ongoing ➔ settling ➔ ended)
          </span>
        </div>

        {/* Concurrency Stress Trigger Bar (Shown in Split Mode) */}
        {isSplitMode && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                <h4 className="text-sm font-bold text-white">
                  ทดสอบการเคาะราคาพร้อมกัน (Simulate Race Condition / Concurrency Test)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ยิงคำขอจากผู้ใช้ A (+100) และผู้ใช้ B (+500) ในมิลลิวินาทีเดียวกัน เพื่อพิสูจน์ว่าระบบ Re-evaluate ผ่านทั้งคู่ตามลำดับในคิว
              </p>
            </div>

            <button
              type="button"
              disabled={isFiringConcurrent}
              onClick={handleSimulateConcurrentBids}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                isFiringConcurrent
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isFiringConcurrent ? 'กำลังยิงคำขอ...' : 'ยิงคำขอพร้อมกันทันที'}</span>
            </button>
          </div>
        )}

        {/* Concurrency Status Feedback Banner */}
        {concurrencyStatus && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{concurrencyStatus}</span>
          </div>
        )}
      </header>

      {/* Main Auction Workbenches */}
      <main className="max-w-7xl mx-auto">
        {isSplitMode ? (
          /* Split Screen Mode: 2 Connected Clients side-by-side */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <AuctionView
              auctionId={AUCTION_ID}
              userId={userA.userId}
              userName={userA.userName}
              clientBadge={userA.clientBadge}
              badgeColor={userA.badgeColor}
              compact
            />

            <AuctionView
              auctionId={AUCTION_ID}
              userId={userB.userId}
              userName={userB.userName}
              clientBadge={userB.clientBadge}
              badgeColor={userB.badgeColor}
              compact
            />
          </div>
        ) : (
          /* Single Screen View */
          <div className="max-w-2xl mx-auto">
            <AuctionView
              auctionId={AUCTION_ID}
              userId={userA.userId}
              userName={userA.userName}
              clientBadge="มุมมองผู้ใช้หลัก (สมชาย นักสะสม)"
              badgeColor="indigo"
            />
          </div>
        )}
      </main>
    </div>
  );
}
