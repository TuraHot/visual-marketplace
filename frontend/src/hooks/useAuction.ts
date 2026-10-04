'use client';

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export interface AuctionData {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  auctionType: 'weekly' | 'rare_monthly';
  startPrice: number;
  currentBid: number;
  minBidStep: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'ongoing' | 'ended' | 'cancelled';
  antiSnipeSeconds: number;
}

export interface BidRecord {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidAmount: number;
  createdAt: string;
}

export function useAuction(socket: Socket | null, auctionId: string) {
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [history, setHistory] = useState<BidRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExtended, setIsExtended] = useState(false);
  const [extensionMessage, setExtensionMessage] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);

  // คำนวณเวลาที่เหลือจาก endTime ของ Server
  const calculateRemainingSeconds = useCallback((endTimeStr: string) => {
    const end = new Date(endTimeStr).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  }, []);

  useEffect(() => {
    if (!socket || !auctionId) return;

    // 1. ส่งคำขอเข้าห้องประมูล
    socket.emit('auction:join', auctionId);

    // 2. รับ State เริ่มต้นของห้องประมูล
    socket.on('auction:state', (data: { auction: AuctionData; history: BidRecord[] }) => {
      setAuction(data.auction);
      setHistory(data.history);
      setTimeLeft(calculateRemainingSeconds(data.auction.endTime));
    });

    // 3. รับแจ้งเตือนเมื่อมีคนเคาะราคาสูงสุดใหม่
    socket.on('auction:bid_updated', (data: {
      currentBid: number;
      highestBidderId: string;
      highestBidderName: string;
      bidTime: string;
    }) => {
      setAuction((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentBid: data.currentBid,
          highestBidderId: data.highestBidderId,
          highestBidderName: data.highestBidderName,
        };
      });

      // เพิ่มประวัติล่าสุดลงบนสุดของ Feed
      const newRecord: BidRecord = {
        id: `bid_${Date.now()}`,
        auctionId,
        bidderId: data.highestBidderId,
        bidderName: data.highestBidderName,
        bidAmount: data.currentBid,
        createdAt: data.bidTime,
      };
      setHistory((prev) => [newRecord, ...prev]);
      setBidError(null);
    });

    // 4. รับแจ้งเตือนเมื่อเกิดการต่อเวลา (Anti-Snipe)
    socket.on('auction:extended', (data: { newEndTime: string; message: string }) => {
      setIsExtended(true);
      setExtensionMessage(data.message);
      setAuction((prev) => (prev ? { ...prev, endTime: data.newEndTime } : null));
      setTimeLeft(calculateRemainingSeconds(data.newEndTime));

      // ซ่อนข้อความแจ้งเตือนต่อเวลาหลังจาก 6 วินาที
      setTimeout(() => {
        setIsExtended(false);
      }, 6000);
    });

    // 5. บิดถูกปฏิเสธ
    socket.on('auction:bid_rejected', (data: { message: string }) => {
      setBidError(data.message);
      setTimeout(() => setBidError(null), 4000);
    });

    return () => {
      socket.emit('auction:leave', auctionId);
      socket.off('auction:state');
      socket.off('auction:bid_updated');
      socket.off('auction:extended');
      socket.off('auction:bid_rejected');
    };
  }, [socket, auctionId, calculateRemainingSeconds]);

  // Timer Countdown ท้องถิ่น
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ฟังก์ชันส่งคำสั่งเคาะราคา
  const placeBid = useCallback((bidAmount: number) => {
    if (!socket) return;
    setBidError(null);
    socket.emit('auction:place_bid', { auctionId, bidAmount });
  }, [socket, auctionId]);

  return {
    auction,
    history,
    timeLeft,
    isExtended,
    extensionMessage,
    bidError,
    placeBid,
  };
}
