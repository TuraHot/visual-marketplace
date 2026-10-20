'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MarketChatBox from '../../components/chat/MarketChatBox';
import { MessageSquare, ToggleLeft, ToggleRight, Sparkles, CheckCircle2, Gavel } from 'lucide-react';

export default function ChatTestPage() {
  const [isSellerOpen, setIsSellerOpen] = useState(true);

  // ข้อมูลจำลองสำหรับทดสอบสองฝั่ง
  const sellerId = 'seller_uncle_01';
  const sellerName = 'ร้านค้าลุงใจดี (ตลาดเสมือน)';
  const buyerId = 'buyer_somchai_01';
  const buyerName = 'คุณสมชาย นักช้อป';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto mb-8 pb-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Real-time Test
              </span>
              <span className="text-xs text-slate-400">ระบบแชทตลาดเสมือน (คนที่ 4 - แฮม)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              ทดสอบระบบ Real-time Chat สองหน้าจอ (Split-Screen)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ลองพิมพ์ข้อความจากฝั่งซ้าย (ผู้ซื้อ) หรือฝั่งขวา (ผู้ขาย) ข้อความจะส่งหากันแบบเรียลไทม์ผ่าน Socket.IO บนพอร์ต 5000 ทันที
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auction"
              className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition shadow-md"
            >
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>ไปที่โรงประมูล</span>
            </Link>

            {/* Toggle Shop Open/Closed Simulation */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl">
              <div className="text-right">
                <span className="text-xs font-semibold block text-slate-200">จำลองสถานะร้านค้า</span>
                <span className={`text-[10px] ${isSellerOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isSellerOpen ? 'เปิดร้านในตลาดเสมือน' : 'ปิดร้านชั่วคราว'}
                </span>
              </div>
              <button
                onClick={() => setIsSellerOpen((prev) => !prev)}
                className="text-slate-300 hover:text-white transition"
                title="สลับสถานะเปิด/ปิดร้าน"
              >
                {isSellerOpen ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Checkpoints */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> รับ-ส่งทันที Real-time
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Typing Indicator กำลังพิมพ์...
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ดักข้อความว่างเปล่า
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ล็อกแชทเมื่อผู้ขายปิดร้าน
          </span>
        </div>
      </div>

      {/* Split-screen Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-items-center">
        {/* Left: Buyer Perspective */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-md mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> หน้าจอผู้ซื้อ (Client A)
            </span>
            <span className="text-[11px] text-slate-400">สมชาย นักช้อป</span>
          </div>
          <MarketChatBox
            sellerId={sellerId}
            sellerName={sellerName}
            buyerId={buyerId}
            buyerName={buyerName}
            currentUserId={buyerId}
            currentUserName={buyerName}
            isSellerOpen={isSellerOpen}
          />
        </div>

        {/* Right: Seller Perspective */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-md mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> หน้าจอผู้ขาย (Client B)
            </span>
            <span className="text-[11px] text-slate-400">ร้านค้าลุงใจดี</span>
          </div>
          <MarketChatBox
            sellerId={sellerId}
            sellerName={sellerName}
            buyerId={buyerId}
            buyerName={buyerName}
            currentUserId={sellerId}
            currentUserName={sellerName}
            isSellerOpen={isSellerOpen}
          />
        </div>
      </div>
    </div>
  );
}
