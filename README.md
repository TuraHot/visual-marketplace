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

## 📚 2. พจนานุกรมข้อมูล (Data Dictionary)

### 📌 ภาพรวมตารางในระบบ (Database Tables Overview)

| ตาราง (Table) | โมดูล (Module) | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| `users` | 1. Users & Wallet | บัญชีผู้ใช้งาน ข้อมูลโปรไฟล์ สกินตัวละคร และยอดคงเหลือในกระเป๋าเงิน |
| `wallet_transactions` | 1. Users & Wallet | บันทึกประวัติรายการเงินเข้า/ออก (เติมเงิน, ซื้อสินค้า, จ่ายค่าประมูล, ถอนเงิน) |
| `notifications` | 1. Users & Wallet | กล่องข้อความแจ้งเตือนสถานะคำสั่งซื้อ การประมูล และกิจกรรมต่าง ๆ |
| `shops` | 2. Shops & Virtual Market | ข้อมูลร้านค้า ตำแหน่งบูธบนแผนที่ 2D (`map_x`, `map_y`) และสถานะเปิดร้านจำลอง |
| `shop_followers` | 2. Shops & Virtual Market | การติดตามร้านค้าของผู้ซื้อ (Many-to-Many ระหว่าง User กับ Shop) |
| `market_schedules` | 2. Shops & Virtual Market | รอบเวลาเปิดตลาดพิเศษ พร้อมวงเงินงบอุดหนุนส่วนลดประจำรอบ |
| `categories` | 3. Products & Orders | หมวดหมู่สินค้า รองรับโครงสร้างแบบลำดับชั้น (Hierarchical / Parent-Child) |
| `products` | 3. Products & Orders | ข้อมูลรายการสินค้า ราคา สต็อก รูปภาพ และส่วนลดพิเศษ |
| `orders` | 3. Products & Orders | คำสั่งซื้อ รายละเอียดช่องทางสั่งซื้อ ยอดชำระ ส่วนลดอุดหนุน และสถานะจัดส่ง |
| `order_items` | 3. Products & Orders | รายการสินค้าย่อยในแต่ละออเดอร์ บันทึกราคาและส่วนลด ณ ตอนสั่งซื้อ |
| `auctions` | 4. Auction Engine | ห้องประมูลสินค้า ราคาเริ่มต้น ราคาขั้นต่ำ และผู้ชนะประมูลปัจจุบัน |
| `auction_bids` | 4. Auction Engine | ประวัติการเคาะราคาบิดประมูลของผู้เข้าร่วม |
| `reviews` | 5. Reviews & Chat | คะแนนและความคิดเห็นต่อร้านค้า (ผูกกับคำสั่งซื้อ ป้องกันการรีวิวปลอม) |
| `chat_messages` | 5. Reviews & Chat | ข้อความสนทนาระหว่างผู้ซื้อและร้านค้าแบบ Real-time |

---

### โมดูลที่ 1: สมาชิกและกระเป๋าเงินเสมือน (Users & Wallet)

#### 1.1 ตาราง `users` (ข้อมูลบัญชีผู้ใช้และยอดเงินคงเหลือ)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK, Default `gen_random_uuid()` | รหัสประจำตัวผู้ใช้ |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | อีเมลสำหรับเข้าสู่ระบบ |
| `password_hash` | `TEXT` | NOT NULL | รหัสผ่านที่เข้ารหัสด้วย bcrypt แล้ว |
| `username` | `VARCHAR(100)` | UNIQUE, NOT NULL | ชื่อบัญชีผู้ใช้ (ใช้อ้างอิงในระบบ) |
| `display_name` | `VARCHAR(150)` | NULL | ชื่อที่แสดงบนหน้าโปรไฟล์และบนหัวตัวละครในแมพ |
| `avatar_url` | `TEXT` | NULL | ลิงก์รูปโปรไฟล์จาก Cloudinary |
| `character_skin` | `VARCHAR(50)` | Default `'default_skin'` | รหัสสกินตัวละครที่ใช้เดินในแมพ Godot |
| `wallet_balance` | `NUMERIC(12,2)` | Default `0.00`, มากกว่าหรือเท่ากับ 0 | ยอดเงินเสมือนที่ใช้ซื้อของได้จริง |
| `held_balance` | `NUMERIC(12,2)` | Default `0.00`, มากกว่าหรือเท่ากับ 0 | ยอดเงินที่ถูกระบบล็อกไว้ชั่วคราวขณะเป็นผู้นำการประมูล |
| `role` | `ENUM (user_role)` | Default `'user'` | สิทธิ์การใช้งาน (`'user'`, `'admin'`) |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่สมัครสมาชิก |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่แก้ไขข้อมูลล่าสุด |

#### 1.2 ตาราง `wallet_transactions` (ประวัติการเคลื่อนไหวของเงินเสมือน)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสธุรกรรม |
| `user_id` | `UUID` | FK (`users.id`), NOT NULL | รหัสเจ้าของกระเป๋าเงิน |
| `type` | `ENUM (tx_type)` | NOT NULL | ประเภทธุรกรรม (`topup`, `purchase`, `sale_revenue`, `subsidy_grant`, `commission_fee`, `auction_hold`, `auction_refund`, `promotion_fee`) |
| `amount` | `NUMERIC(12,2)` | NOT NULL | จำนวนเงินที่เพิ่มหรือลด |
| `balance_after` | `NUMERIC(12,2)` | NOT NULL | ยอดเงินคงเหลือหลังทำรายการเสร็จสิ้น |
| `reference_id` | `UUID` | NULL | รหัสอ้างอิงไปยัง `orders.id` หรือ `auctions.id` |
| `description` | `TEXT` | NULL | รายละเอียดเพิ่มเติมของรายการเดินบัญชี |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่เกิดธุรกรรม |

#### 1.3 ตาราง `notifications` (ระบบแจ้งเตือนผู้ใช้)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสการแจ้งเตือน |
| `user_id` | `UUID` | FK (`users.id`), NOT NULL | ผู้ใช้ที่ได้รับการแจ้งเตือน |
| `title` | `VARCHAR(200)` | NOT NULL | หัวข้อแจ้งเตือน (เช่น มีคนบิดประมูลแซงคุณแล้ว) |
| `body` | `TEXT` | NOT NULL | รายละเอียดข้อความแจ้งเตือน |
| `link_url` | `TEXT` | NULL | ลิงก์สำหรับคลิกไปหน้าปลายทาง |
| `is_read` | `BOOLEAN` | Default `FALSE` | สถานะการอ่าน (`TRUE` = อ่านแล้ว, `FALSE` = ยังไม่อ่าน) |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่แจ้งเตือน |

---

### โมดูลที่ 2: ร้านค้าและตลาดเสมือน (Shops & Virtual Market)

#### 2.1 ตาราง `shops` (ข้อมูลร้านค้าและพิกัดบูธในแมพ Godot)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสร้านค้า |
| `owner_id` | `UUID` | FK (`users.id`), UNIQUE | รหัสผู้ใช้ที่เป็นเจ้าของร้าน (1 บัญชีเปิดได้ 1 ร้าน) |
| `shop_name` | `VARCHAR(150)` | NOT NULL | ชื่อร้านค้า |
| `description` | `TEXT` | NULL | รายละเอียดแนะนำร้านค้า |
| `banner_url` | `TEXT` | NULL | ลิงก์รูปป้ายร้านค้าจาก Cloudinary |
| `booth_code` | `VARCHAR(50)` | UNIQUE, NULL | รหัสล็อกบูธในแมพเสมือน (เช่น `'ZONE_A_01'`) |
| `map_x` | `INT` | NULL | พิกัดแกน X ของบูธร้านค้าในแมพ Isometric |
| `map_y` | `INT` | NULL | พิกัดแกน Y ของบูธร้านค้าในแมพ Isometric |
| `is_virtual_open` | `BOOLEAN` | Default `FALSE` | สถานะว่าผู้ขายกำลังยืนเปิดร้านในตลาดเสมือนหรือไม่ (ใช้ปลดล็อกแชทและส่วนลด Subsidy) |
| `is_premium` | `BOOLEAN` | Default `FALSE` | สถานะแพ็กเกจร้านค้าพรีเมียม |
| `premium_until` | `TIMESTAMPTZ` | NULL | วันหมดอายุสถานะร้านค้าพรีเมียม |
| `rating_avg` | `NUMERIC(3,2)` | Default `0.00` | คะแนนรีวิวเฉลี่ยของร้านค้า (เต็ม 5.00) |
| `rating_count` | `INT` | Default `0` | จำนวนครั้งที่ได้รับการรีวิวทั้งหมด |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่สร้างร้านค้า |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่อัปเดตข้อมูลร้านล่าสุด |

#### 2.2 ตาราง `shop_followers` (ผู้ติดตามร้านค้า)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `shop_id` | `UUID` | PK, FK (`shops.id`) | รหัสร้านค้าที่ถูกติดตาม |
| `user_id` | `UUID` | PK, FK (`users.id`) | รหัสผู้ซื้อที่กดติดตาม |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่กดติดตาม |

#### 2.3 ตาราง `market_schedules` (รอบเวลาเปิด-ปิดตลาดเสมือนและงบเงินอุดหนุน)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสรอบการเปิดตลาดเสมือน |
| `title` | `VARCHAR(150)` | NOT NULL | ชื่อรอบตลาด (เช่น ตลาดนัดรอบค่ำวันศุกร์) |
| `open_time` | `TIMESTAMPTZ` | NOT NULL | วันเวลาที่เริ่มเปิดให้เดินเข้าตลาดเสมือน |
| `close_time` | `TIMESTAMPTZ` | NOT NULL | วันเวลาที่ปิดตลาดเสมือน |
| `subsidy_budget_limit` | `NUMERIC(12,2)` | NOT NULL | เพดานงบเงินอุดหนุนสูงสุดที่แพลตฟอร์มตั้งไว้ในรอบนี้ |
| `subsidy_budget_used` | `NUMERIC(12,2)` | Default `0.00` | ยอดเงินอุดหนุนที่ถูกใช้ไปแล้วในรอบนี้ |
| `is_active` | `BOOLEAN` | Default `FALSE` | สถานะว่าตลาดเสมือนรอบนี้กำลังเปิดใช้งานอยู่หรือไม่ |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่สร้างรอบตลาด |

---

### โมดูลที่ 3: สินค้าและคำสั่งซื้อ (Products & Orders)

#### 3.1 ตาราง `categories` (หมวดหมู่สินค้า)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | PK | รหัสหมวดหมู่ (ตัวเลขรันอัตโนมัติ) |
| `name` | `VARCHAR(100)` | NOT NULL | ชื่อหมวดหมู่สินค้า |
| `slug` | `VARCHAR(100)` | UNIQUE, NOT NULL | ชื่อภาษาอังกฤษสำหรับทำ URL (เช่น `'board-games'`) |
| `parent_id` | `INT` | FK (`categories.id`), NULL | รหัสหมวดหมู่หลัก (กรณีเป็นหมวดหมู่ย่อย) |

#### 3.2 ตาราง `products` (ข้อมูลสินค้า)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสสินค้า |
| `shop_id` | `UUID` | FK (`shops.id`), NOT NULL | รหัสร้านค้าที่เป็นเจ้าของสินค้า |
| `category_id` | `INT` | FK (`categories.id`), NULL | รหัสหมวดหมู่สินค้า |
| `name` | `VARCHAR(255)` | NOT NULL | ชื่อสินค้า |
| `description` | `TEXT` | NULL | รายละเอียดและตำหนิของสินค้า |
| `condition` | `VARCHAR(50)` | Default `'used'` | สภาพสินค้า (`'new'`, `'used'`, `'clearance'`) |
| `price` | `NUMERIC(12,2)` | NOT NULL, มากกว่าหรือเท่ากับ 0 | ราคาขายเต็ม (แสดงผลทั้งหน้า E-commerce และตลาดเสมือน) |
| `subsidy_discount` | `NUMERIC(12,2)` | Default `0.00` | จำนวนเงินส่วนลดที่แพลตฟอร์มออกให้เมื่อซื้อผ่านตลาดเสมือน (เช่น 400.00) |
| `stock_qty` | `INT` | Default `1`, มากกว่าหรือเท่ากับ 0 | จำนวนสินค้าคงเหลือในสต๊อก |
| `image_urls` | `JSONB` | Default `'[]'` | รายการลิงก์รูปภาพสินค้าจาก Cloudinary เก็บในรูปแบบ JSON Array |
| `is_promoted` | `BOOLEAN` | Default `FALSE` | สถานะการซื้อโฆษณาดันสินค้า |
| `promoted_until` | `TIMESTAMPTZ` | NULL | วันเวลาที่หมดอายุการดันสินค้า |
| `is_active` | `BOOLEAN` | Default `TRUE` | สถานะการเปิดขายสินค้า |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่ลงขาย |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่แก้ไขข้อมูลล่าสุด |

#### 3.3 ตาราง `orders` (ใบคำสั่งซื้อและการคำนวณ Subsidy)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสคำสั่งซื้อ |
| `buyer_id` | `UUID` | FK (`users.id`), NOT NULL | รหัสผู้ซื้อ |
| `shop_id` | `UUID` | FK (`shops.id`), NOT NULL | รหัสร้านค้าที่ขาย |
| `market_schedule_id` | `UUID` | FK (`market_schedules.id`), NULL | รหัสรอบตลาดเสมือน (มีค่าเฉพาะเมื่อซื้อในแมพ เพื่อตัดงบ Subsidy) |
| `channel` | `ENUM (sales_channel)` | NOT NULL | ช่องทางที่ซื้อ (`'ecommerce'` หรือ `'virtual_market'`) |
| `original_total` | `NUMERIC(12,2)` | NOT NULL | ราคารวมตั้งต้นก่อนหักส่วนลด (เช่น 5000.00) |
| `subsidy_total` | `NUMERIC(12,2)` | Default `0.00` | เงินอุดหนุนที่แพลตฟอร์มจ่ายแทนผู้ซื้อ (เช่น 400.00 หากซื้อในแมพ) |
| `buyer_paid_total` | `NUMERIC(12,2)` | NOT NULL | ยอดเงินที่ตัดจากกระเป๋าผู้ซื้อจริง (`original_total - subsidy_total` เช่น 4600.00) |
| `commission_rate` | `NUMERIC(5,2)` | NOT NULL | เปอร์เซ็นต์ค่าคอมมิชชันของแพลตฟอร์ม ณ วันที่ซื้อ |
| `commission_fee` | `NUMERIC(12,2)` | NOT NULL | จำนวนเงินค่าคอมมิชชันที่แพลตฟอร์มได้รับ |
| `seller_net_payout` | `NUMERIC(12,2)` | NOT NULL | เงินสุทธิที่โอนให้ผู้ขาย (`original_total - commission_fee`) |
| `status` | `ENUM (order_status)` | Default `'paid'` | สถานะคำสั่งซื้อ (`pending`, `paid`, `shipped`, `completed`, `cancelled`) |
| `shipping_address` | `TEXT` | NULL | ที่อยู่สำหรับจัดส่งสินค้า |
| `tracking_number` | `VARCHAR(100)` | NULL | เลขพัสดุขนส่ง |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่สั่งซื้อ |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่อัปเดตสถานะล่าสุด |

#### 3.4 ตาราง `order_items` (รายการสินค้าย่อยในแต่ละใบคำสั่งซื้อ)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสรายการสินค้าในออเดอร์ |
| `order_id` | `UUID` | FK (`orders.id`), NOT NULL | รหัสคำสั่งซื้อหลัก |
| `product_id` | `UUID` | FK (`products.id`), NOT NULL | รหัสสินค้าที่ซื้อ |
| `quantity` | `INT` | NOT NULL, มากกว่า 0 | จำนวนชิ้นที่ซื้อ |
| `unit_original_price` | `NUMERIC(12,2)` | NOT NULL | ราคาเต็มต่อชิ้น ณ เวลาที่กดซื้อ |
| `unit_subsidy_discount` | `NUMERIC(12,2)` | Default `0.00` | ส่วนลดเงินอุดหนุนต่อชิ้น ณ เวลาที่กดซื้อ |

---

### โมดูลที่ 4: ระบบประมูล (Auction Engine)

#### 4.1 ตาราง `auctions` (รอบการประมูลสินค้า)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสการประมูล |
| `product_id` | `UUID` | FK (`products.id`), NOT NULL | รหัสสินค้าที่นำมาประมูล |
| `shop_id` | `UUID` | FK (`shops.id`), NOT NULL | รหัสร้านค้าเจ้าของสินค้า |
| `type` | `ENUM (auction_type)` | NOT NULL | ประเภทการประมูล (`'weekly_clearance'` รายสัปดาห์, `'monthly_rare'` ของแรร์รายเดือน) |
| `start_price` | `NUMERIC(12,2)` | NOT NULL | ราคาเปิดประมูลขั้นต่ำ |
| `min_increment` | `NUMERIC(12,2)` | NOT NULL | ราคาบิดเพิ่มขั้นต่ำต่อครั้ง |
| `current_price` | `NUMERIC(12,2)` | NOT NULL | ราคาประมูลสูงสุด ณ ปัจจุบัน |
| `current_winner_id` | `UUID` | FK (`users.id`), NULL | รหัสผู้ซื้อที่ให้ราคาสูงสุดอยู่ในขณะนั้น |
| `start_time` | `TIMESTAMPTZ` | NOT NULL | วันเวลาที่เริ่มเปิดให้บิด |
| `end_time` | `TIMESTAMPTZ` | NOT NULL | วันเวลาที่ปิดการประมูล |
| `status` | `ENUM (auction_status)` | Default `'scheduled'` | สถานะ (`scheduled`, `active`, `ended`, `cancelled`) |
| `commission_rate` | `NUMERIC(5,2)` | Default `5.00` | เปอร์เซ็นต์ค่าคอมมิชชันจากการประมูล |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่สร้างรายการประมูล |

#### 4.2 ตาราง `auction_bids` (ประวัติการเคาะราคาประมูล)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสการบิดราคา |
| `auction_id` | `UUID` | FK (`auctions.id`), NOT NULL | รหัสรอบการประมูล |
| `bidder_id` | `UUID` | FK (`users.id`), NOT NULL | รหัสผู้ใช้ที่เคาะราคา |
| `bid_amount` | `NUMERIC(12,2)` | NOT NULL | จำนวนเงินที่เสนอราคา |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | เวลาที่กดบิดราคา (ระดับมิลลิวินาที) |

---

### โมดูลที่ 5: ระบบรีวิวและแชท (Reviews & Chat)

#### 5.1 ตาราง `reviews` (คะแนนและรีวิวร้านค้า)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสรีวิว |
| `order_id` | `UUID` | FK (`orders.id`), UNIQUE | รหัสคำสั่งซื้อที่อ้างอิง (บังคับ 1 ออเดอร์รีวิวได้ 1 ครั้งเพื่อกันปั่นคะแนน) |
| `reviewer_id` | `UUID` | FK (`users.id`), NOT NULL | รหัสผู้ซื้อที่เขียนรีวิว |
| `shop_id` | `UUID` | FK (`shops.id`), NOT NULL | รหัสร้านค้าที่ถูกรีวิว |
| `rating` | `INT` | NOT NULL, 1 ถึง 5 | คะแนนความพึงพอใจ (1 ถึง 5 ดาว) |
| `comment` | `TEXT` | NULL | ข้อความรีวิวจากผู้ซื้อ |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่เขียนรีวิว |

#### 5.2 ตาราง `chat_messages` (ประวัติข้อความแชทในตลาดเสมือน)

| ชื่อฟิลด์ (Column) | ชนิดข้อมูล (Data Type) | Key / Constraint | คำอธิบาย (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | รหัสข้อความแชท |
| `shop_id` | `UUID` | FK (`shops.id`), NOT NULL | รหัสร้านค้าที่กำลังสนทนาอยู่ |
| `sender_id` | `UUID` | FK (`users.id`), NOT NULL | รหัสผู้ส่งข้อความ |
| `receiver_id` | `UUID` | FK (`users.id`), NOT NULL | รหัสผู้รับข้อความ |
| `message` | `TEXT` | NOT NULL | เนื้อหาข้อความที่พูดคุย |
| `is_read` | `BOOLEAN` | Default `FALSE` | สถานะการเปิดอ่านข้อความ |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | วันเวลาที่ส่งข้อความ |

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
