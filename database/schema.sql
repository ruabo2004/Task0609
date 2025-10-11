-- ================================================
-- HOMESTAY MANAGEMENT SYSTEM DATABASE SCHEMA
-- ================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS homestay_db;
USE homestay_db;

-- ================================================
-- 1. BẢNG USERS (Người dùng)
-- ================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE NULL,
    nationality VARCHAR(100) DEFAULT 'Vietnamese',
    id_number VARCHAR(50) NULL,
    address TEXT NULL,
    role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_nationality (nationality),
    INDEX idx_id_number (id_number)
);

-- ================================================
-- 2. BẢNG ROOMS (Phòng)
-- ================================================
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type ENUM('single', 'double', 'suite', 'family') NOT NULL,
    capacity INT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    description TEXT,
    amenities JSON,
    images JSON,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_room_number (room_number),
    INDEX idx_room_type (room_type),
    INDEX idx_status (status),
    INDEX idx_price (price_per_night)
);

-- ================================================
-- 3. BẢNG BOOKINGS (Đặt phòng)
-- ================================================
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_check_in (check_in_date),
    INDEX idx_check_out (check_out_date),
    INDEX idx_status (status),
    INDEX idx_dates (check_in_date, check_out_date)
);

-- ================================================
-- 4. BẢNG PAYMENTS (Thanh toán)
-- ================================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'vnpay', 'momo') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Foreign Keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_date (payment_date)
);

-- ================================================
-- 5. BẢNG SERVICES (Dịch vụ bổ sung)
-- ================================================
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('food', 'tour', 'transport', 'other') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);

-- ================================================
-- 6. BẢNG BOOKING_SERVICES (Dịch vụ đặt kèm)
-- ================================================
CREATE TABLE booking_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_booking_id (booking_id),
    INDEX idx_service_id (service_id),
    
    -- Unique constraint
    UNIQUE KEY unique_booking_service (booking_id, service_id)
);

-- ================================================
-- 7. BẢNG REVIEWS (Đánh giá)
-- ================================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    
    -- Unique constraint (1 review per booking)
    UNIQUE KEY unique_booking_review (booking_id)
);

-- ================================================
-- 8. BẢNG STAFF_REPORTS (Báo cáo nhân viên)
-- ================================================
CREATE TABLE staff_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    report_date DATE NOT NULL,
    checkins_count INT DEFAULT 0,
    checkouts_count INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_staff_id (staff_id),
    INDEX idx_report_date (report_date),
    
    -- Unique constraint (1 report per staff per day)
    UNIQUE KEY unique_staff_daily_report (staff_id, report_date)
);

-- ================================================
-- VIEWS FOR REPORTS
-- ================================================

-- View: Room occupancy statistics
CREATE VIEW room_occupancy_stats AS
SELECT 
    r.id,
    r.room_number,
    r.room_type,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status IN ('confirmed', 'checked_in', 'checked_out') THEN 1 ELSE 0 END) as successful_bookings,
    AVG(b.total_amount) as avg_booking_amount,
    MAX(b.created_at) as last_booking_date
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id
GROUP BY r.id, r.room_number, r.room_type;

-- View: Monthly revenue report
CREATE VIEW monthly_revenue AS
SELECT 
    YEAR(p.payment_date) as year,
    MONTH(p.payment_date) as month,
    COUNT(p.id) as total_payments,
    SUM(p.amount) as total_revenue,
    AVG(p.amount) as avg_payment_amount
FROM payments p
WHERE p.payment_status = 'completed'
GROUP BY YEAR(p.payment_date), MONTH(p.payment_date)
ORDER BY year DESC, month DESC;

-- View: Customer booking history
CREATE VIEW customer_booking_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    COUNT(b.id) as total_bookings,
    SUM(b.total_amount) as total_spent,
    AVG(r.rating) as avg_rating,
    MAX(b.created_at) as last_booking_date
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
LEFT JOIN reviews r ON b.id = r.booking_id
WHERE u.role = 'customer'
GROUP BY u.id, u.full_name, u.email;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger: Update room status when booking is confirmed
DELIMITER //
CREATE TRIGGER update_room_status_on_booking
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'checked_in' AND OLD.status != 'checked_in' THEN
        UPDATE rooms SET status = 'occupied' WHERE id = NEW.room_id;
    ELSEIF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
        UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
    ELSEIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
    END IF;
END //
DELIMITER ;

-- ================================================
-- STORED PROCEDURES
-- ================================================

-- Procedure: Get available rooms for date range
DELIMITER //
CREATE PROCEDURE GetAvailableRooms(
    IN check_in DATE,
    IN check_out DATE,
    IN room_type_filter VARCHAR(20)
)
BEGIN
    SELECT r.*
    FROM rooms r
    WHERE r.status = 'available'
    AND (room_type_filter IS NULL OR r.room_type = room_type_filter)
    AND r.id NOT IN (
        SELECT DISTINCT room_id 
        FROM bookings 
        WHERE status IN ('confirmed', 'checked_in')
        AND (
            (check_in_date <= check_in AND check_out_date > check_in)
            OR (check_in_date < check_out AND check_out_date >= check_out)
            OR (check_in_date >= check_in AND check_out_date <= check_out)
        )
    )
    ORDER BY r.price_per_night ASC;
END //
DELIMITER ;

-- Procedure: Calculate booking total with services
DELIMITER //
CREATE PROCEDURE CalculateBookingTotal(
    IN booking_id_param INT,
    OUT total_amount DECIMAL(10,2)
)
BEGIN
    DECLARE room_cost DECIMAL(10,2) DEFAULT 0;
    DECLARE service_cost DECIMAL(10,2) DEFAULT 0;
    DECLARE nights INT DEFAULT 0;
    
    -- Calculate room cost
    SELECT 
        DATEDIFF(b.check_out_date, b.check_in_date) * r.price_per_night
    INTO room_cost
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.id = booking_id_param;
    
    -- Calculate service cost
    SELECT COALESCE(SUM(bs.quantity * bs.price), 0)
    INTO service_cost
    FROM booking_services bs
    WHERE bs.booking_id = booking_id_param;
    
    SET total_amount = room_cost + service_cost;
END //
DELIMITER ;

-- Show created tables
SHOW TABLES;
