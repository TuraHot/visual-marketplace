###ER Diagram
erDiagram
    USERS ||--o{ WALLET_TRANSACTIONS : "มีประวัติธุรกรรม"
    USERS ||--o| SHOPS : "เป็นเจ้าของร้าน (1 คนเปิดได้ 1 ร้าน)"
    USERS ||--o{ SHOP_FOLLOWERS : "กดติดตาม"
    USERS ||--o{ ORDERS : "สั่งซื้อสินค้า"
    USERS ||--o{ AUCTION_BIDS : "ร่วมบิดประมูล"
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
