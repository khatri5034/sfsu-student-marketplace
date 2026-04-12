CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    school_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500),

    is_student_verified BOOLEAN NOT NULL DEFAULT FALSE,
    account_status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,

    storefront_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    storefront_name VARCHAR(255),
    storefront_description TEXT,
    storefront_banner_url VARCHAR(500),
    storefront_logo_url VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
    ('Textbooks'),
    ('Electronics'),
    ('Furniture'),
    ('Clothing'),
    ('School Supplies'),
    ('Other');

CREATE TABLE pickup_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(20) NOT NULL UNIQUE,   
    course_name VARCHAR(255) NOT NULL          
);


CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NULL,
    category_id INT NULL,
    course_id INT NULL,
    listing_type ENUM('sale', 'trade', 'sale_or_trade') NOT NULL DEFAULT 'sale',
    pickup_location_id INT NULL,
    status ENUM('active', 'sold', 'removed') NOT NULL DEFAULT 'active',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_items_seller
        FOREIGN KEY (seller_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_items_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_items_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_items_pickup_location
        FOREIGN KEY (pickup_location_id) REFERENCES pickup_locations(id)
        ON DELETE SET NULL
);

CREATE TABLE listing_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_listing_images_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE
);

CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    last_message_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversations_item
        FOREIGN KEY (item_id) REFERENCES items(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conversations_buyer
        FOREIGN KEY (buyer_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_conversations_seller
        FOREIGN KEY (seller_id) REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_conversation_pair (item_id, buyer_id, seller_id)
);

CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE trade_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT NOT NULL,
    requested_item_id INT NOT NULL,
    offered_item_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_trade_requests_requester
        FOREIGN KEY (requester_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trade_requests_requested_item
        FOREIGN KEY (requested_item_id) REFERENCES items(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trade_requests_offered_item
        FOREIGN KEY (offered_item_id) REFERENCES items(id)
        ON DELETE CASCADE
);

CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reported_user_id INT NULL,
    reported_item_id INT NULL,
    reason TEXT NOT NULL,
    status ENUM('open', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_reported_user
        FOREIGN KEY (reported_user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reports_reported_item
        FOREIGN KEY (reported_item_id) REFERENCES items(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_report_target
        CHECK (reported_user_id IS NOT NULL OR reported_item_id IS NOT NULL)
);

-- Items: common listing queries
CREATE INDEX idx_items_seller_id ON items(seller_id);
CREATE INDEX idx_items_status_category_created ON items(status, category_id, created_at);
CREATE INDEX idx_items_listing_type ON items(listing_type);
CREATE INDEX idx_items_pickup_location_id ON items(pickup_location_id);

-- Listing images: fetch by item
CREATE INDEX idx_listing_images_item_id ON listing_images(item_id);

-- Courses: lookup by course code and name
CREATE INDEX idx_courses_course_code ON courses(course_code);
CREATE INDEX idx_courses_course_name ON courses(course_name);

-- Conversations: lookup by user and recency
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_item_id ON conversations(item_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Messages: fetch thread and unread counts
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_conversation_created_at ON messages(conversation_id, created_at);

-- Trade requests
CREATE INDEX idx_trade_requests_requester_id ON trade_requests(requester_id);
CREATE INDEX idx_trade_requests_requested_item_id ON trade_requests(requested_item_id);
CREATE INDEX idx_trade_requests_offered_item_id ON trade_requests(offered_item_id);
CREATE INDEX idx_trade_requests_status ON trade_requests(status);

-- Reports
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_reported_item_id ON reports(reported_item_id);
CREATE INDEX idx_reports_status ON reports(status);
