'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import {
  AuctionData,
  BidRecord,
  HighestBidder,
  BidAcceptedPayload,
  BidRejectedPayload,
  AuctionExtendedPayload,
  AuctionEndedPayload,
} from '../types/auction';

export function useAuction(
  socket: Socket | null,
  auctionId: string,
  currentUserId?: string
) {
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [history, setHistory] = useState<BidRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExtended, setIsExtended] = useState(false);
  const [extensionMessage, setExtensionMessage] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [winner, setWinner] = useState<HighestBidder | null>(null);
  const [finalBid, setFinalBid] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time drift offset between server and client
  const serverOffsetRef = useRef<number>(0);

  // Helper to calculate seconds remaining
  const calculateRemainingSeconds = useCallback((endTimeStr: string) => {
    const end = new Date(endTimeStr).getTime();
    const nowWithOffset = Date.now() + serverOffsetRef.current;
    return Math.max(0, Math.floor((end - nowWithOffset) / 1000));
  }, []);

  useEffect(() => {
    if (!socket || !auctionId) return;

    // 1. ขอเข้าห้องประมูล
    socket.emit('auction:join', { auctionId });

    // 2. รับ State เริ่มต้นของห้องประมูล
    const onState = (data: AuctionData & { serverTime?: string; history: BidRecord[] }) => {
      if (data.serverTime) {
        serverOffsetRef.current = new Date(data.serverTime).getTime() - Date.now();
      }
      setAuction(data);
      setHistory(data.history || []);
      setTimeLeft(calculateRemainingSeconds(data.endsAt));
      setIsSettling(data.status === 'settling');
      setIsEnded(data.status === 'ended');
      if (data.status === 'ended' && data.highestBidder) {
        setWinner(data.highestBidder);
        setFinalBid(data.currentBid);
      }
    };

    // 3. รับแจ้งเตือนเมื่อมีคนเคาะราคาสูงสุดใหม่ (Broadcast)
    const onBidUpdated = (data: {
      auctionId: string;
      currentBid: number;
      highestBidder: HighestBidder;
      bidTime: string;
    }) => {
      setAuction((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentBid: data.currentBid,
          highestBidder: data.highestBidder,
        };
      });

      const newRecord: BidRecord = {
        id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        auctionId,
        bidderId: data.highestBidder.userId,
        bidderName: data.highestBidder.userName,
        bidAmount: data.currentBid,
        createdAt: data.bidTime,
      };
      setHistory((prev) => [newRecord, ...prev]);
      setBidError(null);
    };

    // 4. รับการตอบรับการเคาะราคา (เฉพาะผู้เคาะคนนี้)
    const onBidAccepted = (data: BidAcceptedPayload) => {
      setIsSubmitting(false);
      setBidError(null);
      if (data.isExtended) {
        setIsExtended(true);
        setExtensionMessage('การเสนอราคาใน 2 นาทีสุดท้าย! ขยายเวลาเพิ่มเป็น 2 นาที');
      }
    };

    // 5. บิดถูกปฏิเสธ (เฉพาะผู้เคาะคนนี้)
    const onBidRejected = (data: BidRejectedPayload) => {
      setIsSubmitting(false);
      setBidError(data.message);
      setTimeout(() => setBidError(null), 5000);
    };

    // 6. ต่อเวลา (Anti-Snipe)
    const onExtended = (data: AuctionExtendedPayload) => {
      setIsExtended(true);
      setExtensionMessage(data.message);
      setAuction((prev) => (prev ? { ...prev, endsAt: data.newEndsAt } : null));
      setTimeLeft(calculateRemainingSeconds(data.newEndsAt));

      setTimeout(() => {
        setIsExtended(false);
      }, 7000);
    };

    // 7. การประมูลปิดรับ (กำลังเข้าสู่ Settlement)
    const onClosed = (data: { auctionId: string; message: string }) => {
      setIsSettling(true);
      setTimeLeft(0);
      setAuction((prev) => (prev ? { ...prev, status: 'settling' } : null));
    };

    // 8. การประมูลเสร็จสิ้น (Ended)
    const onEnded = (data: AuctionEndedPayload) => {
      setIsSettling(false);
      setIsEnded(true);
      setTimeLeft(0);
      setWinner(data.winner);
      setFinalBid(data.finalBid);
      setAuction((prev) => (prev ? { ...prev, status: 'ended', highestBidder: data.winner, currentBid: data.finalBid } : null));
    };

    socket.on('auction:state', onState);
    socket.on('auction:bid_updated', onBidUpdated);
    socket.on('auction:bid_accepted', onBidAccepted);
    socket.on('auction:bid_rejected', onBidRejected);
    socket.on('auction:extended', onExtended);
    socket.on('auction:closed', onClosed);
    socket.on('auction:ended', onEnded);

    return () => {
      socket.emit('auction:leave', { auctionId });
      socket.off('auction:state', onState);
      socket.off('auction:bid_updated', onBidUpdated);
      socket.off('auction:bid_accepted', onBidAccepted);
      socket.off('auction:bid_rejected', onBidRejected);
      socket.off('auction:extended', onExtended);
      socket.off('auction:closed', onClosed);
      socket.off('auction:ended', onEnded);
    };
  }, [socket, auctionId, calculateRemainingSeconds]);

  // Local Countdown Timer ticker
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

  // ฟังก์ชันเคาะราคา
  const placeBid = useCallback(
    (bidAmount: number) => {
      if (!socket || isSubmitting) return;

      setIsSubmitting(true);
      setBidError(null);

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      socket.emit('auction:place_bid', {
        auctionId,
        requestId,
        bidAmount,
      });

      // Timeout fallback in case of no server response
      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
    },
    [socket, auctionId, isSubmitting]
  );

  // ฟังก์ชันเคาะราคาแบบด่วน
  const quickBid = useCallback(
    (increment: number) => {
      if (!auction) return;
      const base = auction.currentBid || auction.startPrice || 0;
      placeBid(base + increment);
    },
    [auction, placeBid]
  );

  // ฟังก์ชัน Dev/Demo: รีเซ็ตห้องประมูล
  const devReset = useCallback(() => {
    if (!socket) return;
    setIsSettling(false);
    setIsEnded(false);
    setWinner(null);
    setFinalBid(null);
    setBidError(null);
    socket.emit('auction:dev_reset', { auctionId });
  }, [socket, auctionId]);

  // ฟังก์ชัน Dev/Demo: ตั้งเวลาคงเหลือ
  const devSetTimer = useCallback(
    (seconds: number) => {
      if (!socket) return;
      socket.emit('auction:dev_set_timer', { auctionId, seconds });
      setTimeLeft(seconds);
    },
    [socket, auctionId]
  );

  const isHighestBidder = Boolean(
    currentUserId && auction?.highestBidder?.userId === currentUserId
  );

  return {
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
  };
}
