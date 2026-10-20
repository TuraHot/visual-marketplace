<<<<<<< HEAD
# 🌐 Visual Marketplace

<p align="center">
  <strong>แพลตฟอร์มตลาดนัดเสมือนจริง 2D Interactive Virtual Marketplace</strong><br>
  ผสมผสานการช้อปปิ้งแบบ E-Commerce เข้ากับประสบการณ์เดินตลาดจำลองแบบ Real-time
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socketdotio" alt="Socket.io" />
</p>

---

## 📖 สรุปภาพรวมโครงการ (Project Overview)

**Visual Marketplace** เป็นแพลตฟอร์มการซื้อขายสินค้าออนไลน์ที่นำเสนอมุมมองแบบ **Virtual 2D Map** ผู้ใช้งานสามารถเลือกตัวละคร Avatar เดินสำรวจร้านค้าตามพิกัดบูธต่าง ๆ ร่วมงานอีเวนต์ตลาดนัดตามตารางเวลา พร้อมรับเงินอุดหนุนส่วนลด และร่วมประมูลสินค้าได้แบบ Real-time

### ✨ ฟีเจอร์หลัก (Core Features)

* **🗺️ Virtual 2D Map & Booths:** เดินสำรวจบูธร้านค้าบนแผนที่จำลองตามพิกัด `(x, y)` พร้อมดูสถานะการเปิดร้านเสมือนจริง (`is_virtual_open`)
* **🛍️ E-Commerce & Shop Management:** ระบบร้านค้า (1 บัญชีเปิดได้ 1 ร้านค้า), จัดหมวดหมู่สินค้า (`CATEGORIES`), ติดตามร้าน (`SHOP_FOLLOWERS`) และรีวิวหลังสั่งซื้อ
* **🔨 Real-time Live Auction:** ห้องประมูลสินค้าสด รองรับการเคาะราคาแข่งขันแบบ Real-time (`AUCTION_BIDS`) พร้อมระบบล็อกยอดเงินมัดจำ
* **🎪 Market Schedules & Subsidies:** จัดรอบตลาดนัดตามช่วงเวลา พร้อมระบบงบสนับสนุนส่วนลด (`subsidy_discount`) เพื่อกระตุ้นยอดขายในแต่ละรอบ
* **💰 E-Wallet System:** กระเป๋าเงินดิจิทัลในตัว จัดการยอดเงินพร้อมใช้ (`wallet_balance`) และยอดที่ถูกระงับเพื่อประมูล/สั่งซื้อ (`held_balance`)
* **💬 Real-time Chat & Notifications:** ระบบแชทสนทนาระหว่างผู้ซื้อและร้านค้า พร้อมการแจ้งเตือนกิจกรรมสำคัญในระบบ

---

## 🛠️ สถาปัตยกรรมเทคโนโลยี (Tech Stack)

| ส่วนของระบบ | เทคโนโลยีที่เลือกใช้ | รายละเอียด |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | พัฒนาหน้าเว็บ Interactive และการแสดงผลแผนที่ |
| **Styling** | Tailwind CSS v4 | ตกแต่งหน้าตาแบบโมเดิร์น Responsive |
| **Backend** | Node.js, Express 5, TypeScript | พัฒนา REST APIs และ Business Logic |
| **Real-time** | Socket.io / WebSocket | จัดการการเคลื่อนที่บนแผนที่, การประมูล และระบบแชทสด |
| **Database** | PostgreSQL | ฐานข้อมูลเชิงสัมพันธ์ รองรับ UUID, JSONB และ Transaction ความปลอดภัยสูง |

---

## 🗄️ แผนผังฐานข้อมูล (Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ WALLET_TRANSACTIONS : "มีประวัติธุรกรรม"
    USERS ||--o| SHOPS : "เป็นเจ้าของร้าน (1 คนเปิดได้ 1 ร้าน)"
    USERS ||--o{ SHOP_FOLLOWERS : "กดติดตาม"
    USERS ||--o{ ORDERS : "สั่งซื้อสินค้า"
    USERS ||--o{ AUCTION_BIDS : "ร่วมบิดประมูล"
    USERS ||--o{ AUCTIONS : "ชนะการประมูล"
    USERS ||--o{ REVIEWS : "เขียนรีวิว"
    USERS ||--o{ CHAT_MESSAGES : "รับ-ส่งข้อความ"
    USERS ||--o{ NOTIFICATIONS : "รับการแจ้งเตือน"

    SHOPS ||--o{ SHOP_FOLLOWERS : "มีผู้ติดตาม"
    SHOPS ||--o{ PRODUCTS : "ลงขายสินค้า"
    SHOPS ||--o{ ORDERS : "ได้รับคำสั่งซื้อ"
    SHOPS ||--o{ AUCTIONS : "เปิดประมูล"
    SHOPS ||--o{ REVIEWS : "ได้รับรีวิว"
    SHOPS ||--o{ CHAT_MESSAGES : "เป็นห้องสนทนาร้านค้า"

    CATEGORIES ||--o{ CATEGORIES : "เป็นหมวดหมู่หลักของ"
    CATEGORIES ||--o{ PRODUCTS : "จัดหมวดหมู่"

    MARKET_SCHEDULES ||--o{ ORDERS : "ใช้งบอุดหนุนในรอบตลาด"

    PRODUCTS ||--o{ ORDER_ITEMS : "อยู่ในรายการสั่งซื้อ"
    PRODUCTS ||--o{ AUCTIONS : "ถูกนำมาประมูล"

    ORDERS ||--|{ ORDER_ITEMS : "ประกอบด้วยรายการย่อย"
    ORDERS ||--o| REVIEWS : "ถูกประเมินคะแนน (1 ออเดอร์รีวิวได้ 1 ครั้ง)"

    AUCTIONS ||--o{ AUCTION_BIDS : "มีประวัติการเคาะราคา"

    USERS {
        UUID id PK
        VARCHAR email UK
        TEXT password_hash
        VARCHAR username UK
        VARCHAR display_name
        TEXT avatar_url
        VARCHAR character_skin
        NUMERIC wallet_balance
        NUMERIC held_balance
        ENUM role
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    WALLET_TRANSACTIONS {
        UUID id PK
        UUID user_id FK
        ENUM type
        NUMERIC amount
        NUMERIC balance_after
        UUID reference_id
        TEXT description
        TIMESTAMPTZ created_at
    }

    SHOPS {
        UUID id PK
        UUID owner_id FK,UK
        VARCHAR shop_name
        TEXT description
        TEXT banner_url
        VARCHAR booth_code UK
        INT map_x
        INT map_y
        BOOLEAN is_virtual_open
        BOOLEAN is_premium
        TIMESTAMPTZ premium_until
        NUMERIC rating_avg
        INT rating_count
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    SHOP_FOLLOWERS {
        UUID shop_id PK,FK
        UUID user_id PK,FK
        TIMESTAMPTZ created_at
    }

    MARKET_SCHEDULES {
        UUID id PK
        VARCHAR title
        TIMESTAMPTZ open_time
        TIMESTAMPTZ close_time
        NUMERIC subsidy_budget_limit
        NUMERIC subsidy_budget_used
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    CATEGORIES {
        SERIAL id PK
        VARCHAR name
        VARCHAR slug UK
        INT parent_id FK
    }

    PRODUCTS {
        UUID id PK
        UUID shop_id FK
        INT category_id FK
        VARCHAR name
        TEXT description
        VARCHAR condition
        NUMERIC price
        NUMERIC subsidy_discount
        INT stock_qty
        JSONB image_urls
        BOOLEAN is_promoted
        TIMESTAMPTZ promoted_until
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ORDERS {
        UUID id PK
        UUID buyer_id FK
        UUID shop_id FK
        UUID market_schedule_id FK
        ENUM channel
        NUMERIC original_total
        NUMERIC subsidy_total
        NUMERIC buyer_paid_total
        NUMERIC commission_rate
        NUMERIC commission_fee
        NUMERIC seller_net_payout
        ENUM status
        TEXT shipping_address
        VARCHAR tracking_number
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        INT quantity
        NUMERIC unit_original_price
        NUMERIC unit_subsidy_discount
    }

    AUCTIONS {
        UUID id PK
        UUID product_id FK
        UUID shop_id FK
        ENUM type
        NUMERIC start_price
        NUMERIC min_increment
        NUMERIC current_price
        UUID current_winner_id FK
        TIMESTAMPTZ start_time
        TIMESTAMPTZ end_time
        ENUM status
        NUMERIC commission_rate
        TIMESTAMPTZ created_at
    }

    AUCTION_BIDS {
        UUID id PK
        UUID auction_id FK
        UUID bidder_id FK
        NUMERIC bid_amount
        TIMESTAMPTZ created_at
    }

    REVIEWS {
        UUID id PK
        UUID order_id FK,UK
        UUID reviewer_id FK
        UUID shop_id FK
        INT rating
        TEXT comment
        TIMESTAMPTZ created_at
    }

    CHAT_MESSAGES {
        UUID id PK
        UUID shop_id FK
        UUID sender_id FK
        UUID receiver_id FK
        TEXT message
        BOOLEAN is_read
        TIMESTAMPTZ created_at
    }

    NOTIFICATIONS {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TEXT body
        TEXT link_url
        BOOLEAN is_read
        TIMESTAMPTZ created_at
    }
```

---

## 📚 สรุปความหมายของแต่ละตาราง (Database Dictionary)

| ตาราง (Table) | หน้าที่และความรับผิดชอบ |
| :--- | :--- |
| `USERS` | บัญชีผู้ใช้งาน ข้อมูลโปรไฟล์ สกินตัวละคร และยอดคงเหลือในกระเป๋าเงิน |
| `WALLET_TRANSACTIONS` | บันทึกประวัติรายการเงินเข้า/ออก (เติมเงิน, ซื้อสินค้า, จ่ายค่าประมูล, ถอนเงิน) |
| `SHOPS` | ข้อมูลร้านค้า ตำแหน่งบูธบนแผนที่ 2D (`map_x`, `map_y`) และสถานะเปิดร้านจำลอง |
| `SHOP_FOLLOWERS` | การติดตามร้านค้าของผู้ซื้อ (Many-to-Many ระหว่าง User กับ Shop) |
| `MARKET_SCHEDULES` | รอบเวลาเปิดตลาดพิเศษ พร้อมวงเงินงบอุดหนุนส่วนลดประจำรอบ |
| `CATEGORIES` | หมวดหมู่สินค้า รองรับโครงสร้างแบบลำดับชั้น (Hierarchical / Parent-Child) |
| `PRODUCTS` | ข้อมูลรายการสินค้า ราคา สต็อก รูปภาพ และส่วนลดพิเศษ |
| `ORDERS` | คำสั่งซื้อ รายละเอียดช่องทางสั่งซื้อ ยอดชำระ ส่วนลดอุดหนุน และสถานะจัดส่ง |
| `ORDER_ITEMS` | รายการสินค้าย่อยในแต่ละออเดอร์ บันทึกราคาและส่วนลด ณ ตอนสั่งซื้อ |
| `AUCTIONS` | ห้องประมูลสินค้า ราคาเริ่มต้น ราคาขั้นต่ำ และผู้ชนะประมูลปัจจุบัน |
| `AUCTION_BIDS` | ประวัติการเคาะราคาบิดประมูลของผู้เข้าร่วม |
| `REVIEWS` | คะแนนและความคิดเห็นต่อร้านค้า (ผูกกับคำสั่งซื้อ ป้องกันการรีวิวปลอม) |
| `CHAT_MESSAGES` | ข้อความสนทนาระหว่างผู้ซื้อและร้านค้าแบบ Real-time |
| `NOTIFICATIONS` | กล่องข้อความแจ้งเตือนสถานะคำสั่งซื้อ การประมูล และกิจกรรมต่าง ๆ |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
visual-marketplace/
├── frontend/               # Next.js 16 Web Application
│   ├── src/
│   │   └── app/            # App Router pages & layouts
│   ├── public/             # Static assets & game sprites
│   └── package.json
├── backend/                # Express 5 REST API & Realtime Server
│   ├── src/
│   │   ├── configs/        # Database & Environment configs
│   │   ├── controllers/    # API Controllers
│   │   ├── middlewares/    # Auth, Validation middlewares
│   │   ├── services/       # Core Business logic
│   │   └── sockets/        # WebSocket/Socket.io handlers
│   ├── app.ts
│   └── package.json
└── README.md               # Project documentation
```

### ER Diagram

>>>>>>> e7b1289d01c182ed1bee59a4ed1e9e5d921a91e8


