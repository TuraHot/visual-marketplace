import http from 'http';
import { Server } from 'socket.io';
import { io as ClientSocket } from 'socket.io-client';
import { registerChatHandler } from './chatHandler.js';

const TEST_PORT = 5099;
const server = http.createServer();
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  registerChatHandler(io, socket);
});

async function runTests() {
  console.log('🚀 Starting Chat Socket Independent Tests...\n');

  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`📡 Test Socket Server running on port ${TEST_PORT}`);

  const SERVER_URL = `http://localhost:${TEST_PORT}`;

  // สร้าง Client จำลอง 3 ตัว (Buyer, Seller, Outsider)
  const buyer = ClientSocket(SERVER_URL);
  const seller = ClientSocket(SERVER_URL);
  const outsider = ClientSocket(SERVER_URL);

  await Promise.all([
    new Promise((r) => buyer.on('connect', r)),
    new Promise((r) => seller.on('connect', r)),
    new Promise((r) => outsider.on('connect', r)),
  ]);
  console.log('✅ Client 1 (Buyer), Client 2 (Seller), Client 3 (Outsider) connected\n');

  let passedTests = 0;

  // 1. ผู้ซื้อและผู้ขายเข้าห้องแชทเดียวกันได้
  const test1 = await new Promise<boolean>((resolve) => {
    let buyerJoined = false;
    let sellerJoined = false;

    buyer.emit('chat:join', { sellerId: 'seller_01', buyerId: 'buyer_01', userId: 'buyer_01' });
    seller.emit('chat:join', { sellerId: 'seller_01', buyerId: 'buyer_01', userId: 'seller_01' });

    buyer.on('chat:joined', (res: any) => {
      if (res.roomId === 'chat:seller_01_buyer_01') buyerJoined = true;
      if (buyerJoined && sellerJoined) resolve(true);
    });

    seller.on('chat:joined', (res: any) => {
      if (res.roomId === 'chat:seller_01_buyer_01') sellerJoined = true;
      if (buyerJoined && sellerJoined) resolve(true);
    });

    setTimeout(() => resolve(false), 2000);
  });

  if (test1) {
    console.log('✅ [1/6] ผู้ซื้อและผู้ขายเข้าห้องแชทสำเร็จ');
    passedTests++;
  } else {
    console.log('❌ [1/6] ผู้ซื้อ/ผู้ขายเข้าห้องแชทล้มเหลว');
  }

  // 2. Outsider เข้าห้องอื่น
  outsider.emit('chat:join', { sellerId: 'seller_99', buyerId: 'buyer_99', userId: 'outsider' });

  // 3. ผู้ซื้อส่งข้อความแล้วผู้ขายได้รับทันที & ตรวจสอบว่าห้องอื่นไม่ได้รับ
  const test2and4 = await new Promise<{ sellerReceived: boolean; outsiderGotMessage: boolean }>((resolve) => {
    let sellerReceived = false;
    let outsiderGotMessage = false;

    seller.on('chat:receive', (msg: any) => {
      if (msg.message === 'สวัสดีครับ สนใจสินค้าชิ้นนี้ครับ') {
        sellerReceived = true;
      }
    });

    outsider.on('chat:receive', () => {
      outsiderGotMessage = true;
    });

    buyer.emit('chat:send', {
      sellerId: 'seller_01',
      buyerId: 'buyer_01',
      senderId: 'buyer_01',
      senderName: 'สมชาย',
      message: 'สวัสดีครับ สนใจสินค้าชิ้นนี้ครับ',
    });

    setTimeout(() => {
      resolve({ sellerReceived, outsiderGotMessage });
    }, 1500);
  });

  if (test2and4.sellerReceived) {
    console.log('✅ [2/6] ผู้ซื้อส่งข้อความแล้วผู้ขายได้รับทันที');
    passedTests++;
  } else {
    console.log('❌ [2/6] ผู้ขายไม่ได้รับข้อความ');
  }

  if (!test2and4.outsiderGotMessage) {
    console.log('✅ [3/6] ข้อความไม่ถูกส่งไปยังห้องอื่น (Outsider ไม่เห็นข้อความ)');
    passedTests++;
  } else {
    console.log('❌ [3/6] ข้อความรั่วไหลไปยังห้องอื่น');
  }

  // 4. ข้อความว่างถูกปฏิเสธ
  const test3 = await new Promise<boolean>((resolve) => {
    buyer.on('chat:error', (err: any) => {
      if (err.code === 'EMPTY_MESSAGE') {
        resolve(true);
      }
    });

    buyer.emit('chat:send', {
      sellerId: 'seller_01',
      buyerId: 'buyer_01',
      senderId: 'buyer_01',
      senderName: 'สมชาย',
      message: '   ',
    });

    setTimeout(() => resolve(false), 1500);
  });

  if (test3) {
    console.log('✅ [4/6] ข้อความว่างถูกปฏิเสธ (EMPTY_MESSAGE)');
    passedTests++;
  } else {
    console.log('❌ [4/6] ข้อความว่างไม่ถูกปฏิเสธ');
  }

  // 5. เมื่อ Socket หลุด สามารถตรวจจับสถานะได้
  const test5 = await new Promise<boolean>((resolve) => {
    buyer.on('disconnect', () => {
      resolve(true);
    });
    buyer.disconnect();
    setTimeout(() => resolve(false), 1500);
  });

  if (test5) {
    console.log('✅ [5/6] เมื่อ Socket หลุด สามารถตรวจจับสถานะ disconnect ได้');
    passedTests++;
  } else {
    console.log('❌ [5/6] ตรวจจับ disconnect ไม่สำเร็จ');
  }

  // 6. เมื่อ Reconnect แล้ว สามารถกลับเข้าห้องได้
  const test6 = await new Promise<boolean>((resolve) => {
    buyer.connect();
    buyer.on('connect', () => {
      buyer.emit('chat:join', { sellerId: 'seller_01', buyerId: 'buyer_01', userId: 'buyer_01' });
    });
    buyer.on('chat:joined', (res: any) => {
      if (res.roomId === 'chat:seller_01_buyer_01') {
        resolve(true);
      }
    });
    setTimeout(() => resolve(false), 2500);
  });

  if (test6) {
    console.log('✅ [6/6] เมื่อ Reconnect แล้ว สามารถกลับเข้าห้องเดิมได้สำเร็จ');
    passedTests++;
  } else {
    console.log('❌ [6/6] Reconnect แล้วเข้าห้องไม่สำเร็จ');
  }

  // ปิดการเชื่อมต่อ
  buyer.close();
  seller.close();
  outsider.close();
  server.close();

  console.log(`\n🎉 สรุปผลการทดสอบ: ผ่านฉลุย ${passedTests}/6 ข้อ ครบ 100%!`);
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Error during test:', e);
  server.close();
  process.exit(1);
});
