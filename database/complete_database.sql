-- ================================================
-- HOMESTAY MANAGEMENT SYSTEM - COMPLETE DATABASE
-- Schema + Sample Data + Reviews
-- ================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS homestay_db;
USE homestay_db;

-- Disable foreign key checks for easier insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 1. BẢNG USERS (Người dùng)
-- ================================================
DROP TABLE IF EXISTS users;
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
DROP TABLE IF EXISTS rooms;
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
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_status (status),
    INDEX idx_check_dates (check_in_date, check_out_date),
    INDEX idx_created_at (created_at)
);

-- ================================================
-- 4. BẢNG PAYMENTS (Thanh toán)
-- ================================================
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'vnpay', 'momo', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_date (payment_date)
);

-- ================================================
-- 5. BẢNG SERVICES (Dịch vụ)
-- ================================================
DROP TABLE IF EXISTS services;
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('food', 'transport', 'entertainment', 'spa', 'other') DEFAULT 'other',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);

-- ================================================
-- 6. BẢNG BOOKING_SERVICES (Dịch vụ đặt phòng)
-- ================================================
DROP TABLE IF EXISTS booking_services;
CREATE TABLE booking_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
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
DROP TABLE IF EXISTS reviews;
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
DROP TABLE IF EXISTS staff_reports;
CREATE TABLE staff_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    report_date DATE NOT NULL,
    checkins_count INT DEFAULT 0,
    checkouts_count INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_staff_id (staff_id),
    INDEX idx_report_date (report_date),
    INDEX idx_created_at (created_at),
    
    -- Unique constraint
    UNIQUE KEY unique_staff_date (staff_id, report_date)
);

-- ================================================
-- INSERT SAMPLE DATA
-- ================================================

-- ================================================
-- 1. SAMPLE USERS
-- ================================================
INSERT INTO users (email, password, full_name, phone, role, is_active) VALUES
-- Admin user (password: admin123)
('admin@homestay.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Quản trị viên', '0901234567', 'admin', TRUE),

-- Staff users (password: staff123)
('staff1@homestay.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Nguyễn Văn An', '0901234568', 'staff', TRUE),
('staff2@homestay.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Trần Thị Bình', '0901234569', 'staff', TRUE),

-- Customer users (password: customer123)
('customer1@gmail.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Lê Văn Cường', '0901234570', 'customer', TRUE),
('customer2@gmail.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Phạm Thị Dung', '0901234571', 'customer', TRUE),
('customer3@gmail.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Hoàng Minh Đức', '0901234572', 'customer', TRUE),
('customer4@gmail.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Ngô Thị Hoa', '0901234573', 'customer', TRUE);

-- ================================================
-- 2. SAMPLE ROOMS
-- ================================================
INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, amenities, images, status) VALUES
-- Single rooms
('101', 'single', 1, 500000.00, 'Phòng đơn tiện nghi, view núi đẹp', 
 '["WiFi", "Điều hòa", "TV", "Tủ lạnh mini", "Ban công"]', 
 '["room101_1.jpg", "room101_2.jpg"]', 'available'),

('102', 'single', 1, 450000.00, 'Phòng đơn cơ bản, thoáng mát', 
 '["WiFi", "Điều hòa", "TV", "Ban công"]', 
 '["room102_1.jpg", "room102_2.jpg"]', 'available'),

-- Double rooms  
('201', 'double', 2, 800000.00, 'Phòng đôi cao cấp với giường king size', 
 '["WiFi", "Điều hòa", "TV 43inch", "Tủ lạnh", "Ban công rộng", "Bồn tắm"]', 
 '["room201_1.jpg", "room201_2.jpg", "room201_3.jpg"]', 'available'),

('202', 'double', 2, 750000.00, 'Phòng đôi tiêu chuẩn, view vườn', 
 '["WiFi", "Điều hòa", "TV", "Tủ lạnh mini", "Ban công"]', 
 '["room202_1.jpg", "room202_2.jpg"]', 'available'),

('203', 'double', 2, 780000.00, 'Phòng đôi view hồ bơi', 
 '["WiFi", "Điều hòa", "TV", "Tủ lạnh", "Ban công view hồ bơi"]', 
 '["room203_1.jpg", "room203_2.jpg"]', 'available'),

-- Suite rooms
('301', 'suite', 4, 1200000.00, 'Suite cao cấp với phòng khách riêng', 
 '["WiFi", "Điều hòa", "TV 55inch", "Tủ lạnh lớn", "Phòng khách", "Bếp nhỏ", "Ban công lớn"]', 
 '["room301_1.jpg", "room301_2.jpg", "room301_3.jpg", "room301_4.jpg"]', 'available'),

('302', 'suite', 3, 1000000.00, 'Suite gia đình với 2 phòng ngủ', 
 '["WiFi", "Điều hòa", "TV", "Tủ lạnh", "2 phòng ngủ", "Ban công"]', 
 '["room302_1.jpg", "room302_2.jpg"]', 'available'),

-- Family rooms
('401', 'family', 6, 1500000.00, 'Phòng gia đình lớn với 3 giường', 
 '["WiFi", "Điều hòa", "TV lớn", "Tủ lạnh", "3 giường đôi", "Phòng khách", "Ban công rộng"]', 
 '["room401_1.jpg", "room401_2.jpg", "room401_3.jpg"]', 'available'),

('402', 'family', 5, 1300000.00, 'Phòng gia đình view biển', 
 '["WiFi", "Điều hòa", "TV", "Tủ lạnh", "2 giường đôi + 1 giường đơn", "Ban công view biển"]', 
 '["room402_1.jpg", "room402_2.jpg"]', 'available'),

-- Premium suite
('501', 'suite', 4, 1800000.00, 'Presidential Suite với jacuzzi', 
 '["WiFi", "Điều hòa", "TV 65inch", "Tủ lạnh wine", "Jacuzzi", "Phòng khách sang trọng", "Ban công penthouse"]', 
 '["room501_1.jpg", "room501_2.jpg", "room501_3.jpg", "room501_4.jpg", "room501_5.jpg"]', 'available');

-- ================================================
-- 3. SAMPLE SERVICES
-- ================================================
INSERT INTO services (name, description, price, category, is_active) VALUES
-- Food services
('Bữa sáng buffet', 'Buffet sáng đa dạng món Việt và Âu', 150000.00, 'food', TRUE),
('Bữa trưa set menu', 'Set menu bữa trưa 3 món', 200000.00, 'food', TRUE),
('Bữa tối cao cấp', 'Thực đơn tối cao cấp 5 món', 350000.00, 'food', TRUE),
('Đồ uống welcome', 'Nước chào mừng và trái cây', 50000.00, 'food', TRUE),

-- Transport services  
('Đưa đón sân bay', 'Dịch vụ đưa đón sân bay Nội Bài', 500000.00, 'transport', TRUE),
('Thuê xe máy', 'Thuê xe máy theo ngày', 150000.00, 'transport', TRUE),
('Thuê xe ô tô 4 chỗ', 'Thuê xe ô tô có tài xế', 800000.00, 'transport', TRUE),
('Tour city', 'Tour tham quan thành phố nửa ngày', 300000.00, 'transport', TRUE),

-- Entertainment services
('Massage thư giãn', 'Dịch vụ massage thư giãn 60 phút', 400000.00, 'spa', TRUE),
('Karaoke', 'Phòng karaoke 2 tiếng', 200000.00, 'entertainment', TRUE),
('Hồ bơi riêng', 'Sử dụng hồ bơi riêng 2 tiếng', 300000.00, 'entertainment', TRUE),

-- Other services
('Giặt ủi', 'Dịch vụ giặt ủi quần áo', 100000.00, 'other', TRUE),
('Late checkout', 'Trả phòng muộn đến 15:00', 200000.00, 'other', TRUE),
('Trang trí phòng', 'Trang trí phòng đặc biệt (sinh nhật, kỷ niệm)', 250000.00, 'other', TRUE);

-- ================================================
-- 4. SAMPLE BOOKINGS
-- ================================================

-- Booking 1: Customer 1 - Room 203 (confirmed)
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status, special_requests) VALUES
(4, 3, '2024-01-15', '2024-01-18', 2, 2400000.00, 'confirmed', 'Yêu cầu phòng view đẹp');

-- Booking 2: Customer 2 - Room 301 (checked_out)  
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status, special_requests) VALUES
(5, 6, '2024-01-10', '2024-01-13', 3, 3600000.00, 'checked_out', 'Cần thêm giường phụ cho trẻ em');

-- Booking 3: Customer 3 - Room 203 (checked_in - current)
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status) VALUES
(6, 5, '2024-01-20', '2024-01-23', 2, 2340000.00, 'checked_in');

-- Booking 4: Customer 4 - Room 401 (pending)
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status, special_requests) VALUES
(7, 8, '2024-02-01', '2024-02-04', 5, 4500000.00, 'pending', 'Gia đình có trẻ nhỏ, cần cũi');

-- Booking 5: Customer 1 - Room 102 (cancelled)
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status) VALUES
(4, 2, '2024-01-25', '2024-01-27', 1, 900000.00, 'cancelled');

-- Additional completed bookings for review testing
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status, special_requests) VALUES
(4, 1, '2024-01-05', '2024-01-08', 2, 1500000.00, 'completed', 'Phòng tầng cao'),
(5, 4, '2024-01-12', '2024-01-15', 3, 2250000.00, 'completed', 'Gần thang máy'),
(4, 7, '2024-01-18', '2024-01-21', 4, 3200000.00, 'completed', 'View hồ bơi'),
(5, 9, '2024-01-22', '2024-01-25', 2, 3600000.00, 'completed', 'Honeymoon suite'),
(4, 10, '2024-01-26', '2024-01-28', 2, 3600000.00, 'completed', 'Presidential suite'),
(5, 8, '2024-01-29', '2024-02-01', 4, 3900000.00, 'completed', 'Family vacation');

-- ================================================
-- 5. SAMPLE PAYMENTS
-- ================================================

-- Payment for booking 1
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes) VALUES
(1, 2400000.00, 'vnpay', 'completed', 'VNP_TXN_001_20240115', 'Thanh toán qua VNPay thành công');

-- Payment for booking 2
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes) VALUES
(2, 3600000.00, 'card', 'completed', 'CARD_TXN_002_20240110', 'Thanh toán bằng thẻ tín dụng');

-- Payment for booking 3 (partial)
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes) VALUES
(3, 1000000.00, 'cash', 'completed', NULL, 'Đặt cọc bằng tiền mặt');

-- Payment for booking 4 (pending)
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes) VALUES
(4, 4500000.00, 'vnpay', 'pending', 'VNP_TXN_004_20240201', 'Chờ thanh toán VNPay');

-- Payments for completed bookings
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes) VALUES
(6, 1500000.00, 'vnpay', 'completed', 'VNP_TXN_006_20240105', 'Thanh toán hoàn tất'),
(7, 2250000.00, 'card', 'completed', 'CARD_TXN_007_20240112', 'Thanh toán thẻ tín dụng'),
(8, 3200000.00, 'vnpay', 'completed', 'VNP_TXN_008_20240118', 'Thanh toán VNPay'),
(9, 3600000.00, 'cash', 'completed', NULL, 'Thanh toán tiền mặt'),
(10, 3600000.00, 'vnpay', 'completed', 'VNP_TXN_010_20240126', 'Presidential suite payment'),
(11, 3900000.00, 'card', 'completed', 'CARD_TXN_011_20240129', 'Family booking payment');

-- ================================================
-- 6. SAMPLE BOOKING_SERVICES
-- ================================================

-- Services for booking 1
INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 150000.00, 300000.00), -- Breakfast for 2 people
(1, 9, 1, 400000.00, 400000.00); -- Massage service

-- Services for booking 2  
INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, total_price) VALUES
(2, 1, 3, 150000.00, 450000.00), -- Breakfast for 3 people
(2, 5, 1, 500000.00, 500000.00), -- Airport pickup
(2, 14, 1, 250000.00, 250000.00); -- Room decoration

-- Services for completed bookings
INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, total_price) VALUES
(6, 1, 2, 150000.00, 300000.00), -- Breakfast
(7, 1, 3, 150000.00, 450000.00), -- Breakfast for 3
(7, 6, 2, 150000.00, 300000.00), -- Motorbike rental
(8, 3, 4, 350000.00, 1400000.00), -- Dinner for 4
(9, 14, 1, 250000.00, 250000.00), -- Room decoration for honeymoon
(10, 1, 2, 150000.00, 300000.00), -- Presidential breakfast
(10, 9, 2, 400000.00, 800000.00); -- Couple massage

-- ================================================
-- 7. SAMPLE REVIEWS (WITH NEW FAKE DATA)
-- ================================================

INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES
-- Reviews for original bookings
(2, 5, 5, 'Dịch vụ tuyệt vời! Phòng sạch sẽ, nhân viên nhiệt tình. Sẽ quay lại lần sau.'),

-- Reviews for completed bookings (for testing review system)
(6, 4, 5, 'Phòng tuyệt vời! View đẹp, sạch sẽ. Nhân viên phục vụ rất tốt. Tầng cao như yêu cầu.'),
(7, 5, 4, 'Phòng khá ổn, gần thang máy tiện lợi. Có điều wifi hơi chậm vào buổi tối. Nhìn chung hài lòng.'),
(8, 4, 5, 'Dịch vụ xuất sắc! Phòng rộng rãi, view hồ bơi tuyệt đẹp. Bữa tối rất ngon. Sẽ giới thiệu bạn bè.'),
(9, 5, 5, 'Trải nghiệm honeymoon tuyệt vời! Phòng được trang trí lãng mạn, dịch vụ hoàn hảo. Cảm ơn team rất nhiều!'),
(10, 4, 5, 'Presidential Suite thật sự đẳng cấp! Jacuzzi tuyệt vời, view penthouse choáng ngợp. Đáng từng đồng!'),
(11, 5, 4, 'Kỳ nghỉ gia đình tuyệt vời. Phòng rộng, trẻ em rất thích. Chỉ có điều hồ bơi hơi đông vào cuối tuần.');

-- ================================================
-- 8. SAMPLE STAFF_REPORTS
-- ================================================

INSERT INTO staff_reports (staff_id, report_date, checkins_count, checkouts_count, total_revenue, notes) VALUES
(2, '2024-01-15', 2, 1, 2400000.00, 'Ngày bận rộn với nhiều khách check-in'),
(3, '2024-01-15', 1, 0, 0, 'Hỗ trợ khách hàng và dọn dẹp phòng'),
(2, '2024-01-16', 0, 1, 3600000.00, 'Khách check-out và thanh toán đầy đủ'),
(3, '2024-01-16', 1, 0, 0, 'Đón tiếp khách mới và hướng dẫn dịch vụ');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- VIEWS FOR REPORTS
-- ================================================

-- View: Room occupancy statistics
DROP VIEW IF EXISTS room_occupancy_stats;
CREATE VIEW room_occupancy_stats AS
SELECT 
    r.id,
    r.room_number,
    r.room_type,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status IN ('confirmed', 'checked_in', 'checked_out', 'completed') THEN 1 ELSE 0 END) as successful_bookings,
    AVG(b.total_amount) as avg_booking_amount,
    MAX(b.created_at) as last_booking_date
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id
GROUP BY r.id, r.room_number, r.room_type;

-- View: Monthly revenue report
DROP VIEW IF EXISTS monthly_revenue;
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
DROP VIEW IF EXISTS customer_booking_summary;
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
DROP PROCEDURE IF EXISTS GetAvailableRooms;
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
        WHERE status IN ('confirmed', 'checked_in', 'completed')
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
DROP PROCEDURE IF EXISTS CalculateBookingTotal;
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
    SELECT COALESCE(SUM(bs.quantity * bs.total_price), 0)
    INTO service_cost
    FROM booking_services bs
    WHERE bs.booking_id = booking_id_param;
    
    SET total_amount = room_cost + service_cost;
END //
DELIMITER ;

-- ================================================
-- SHOW FINAL STATISTICS
-- ================================================
SELECT 'Database Setup Complete!' as Status;
SELECT COUNT(*) as Total_Users FROM users;
SELECT COUNT(*) as Total_Rooms FROM rooms;
SELECT COUNT(*) as Total_Bookings FROM bookings;
SELECT COUNT(*) as Completed_Bookings FROM bookings WHERE status = 'completed';
SELECT COUNT(*) as Total_Reviews FROM reviews;
SELECT COUNT(*) as Total_Services FROM services;
SELECT COUNT(*) as Total_Payments FROM payments;

-- ================================================
-- EMPLOYEE MODULE - ADDITIONAL TABLES
-- ================================================

-- ================================================
-- 9. BẢNG STAFF_PROFILES - Hồ sơ nhân viên chi tiết
-- ================================================
DROP TABLE IF EXISTS staff_profiles;
CREATE TABLE staff_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department ENUM('reception', 'housekeeping', 'maintenance', 'management') NOT NULL,
    position VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2) DEFAULT 0.00,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    work_schedule JSON,
    permissions JSON,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_hire_date (hire_date),
    
    -- Unique constraint
    UNIQUE KEY unique_user_employee (user_id)
);

-- ================================================
-- 10. BẢNG WORK_SHIFTS - Ca làm việc
-- ================================================
DROP TABLE IF EXISTS work_shifts;
CREATE TABLE work_shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    shift_date DATE NOT NULL,
    shift_type ENUM('morning', 'afternoon', 'night', 'full_day') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'missed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_staff_id (staff_id),
    INDEX idx_shift_date (shift_date),
    INDEX idx_shift_type (shift_type),
    INDEX idx_status (status),
    INDEX idx_date_staff (shift_date, staff_id),
    
    -- Unique constraint to prevent double booking
    UNIQUE KEY unique_staff_date_time (staff_id, shift_date, start_time, end_time)
);

-- ================================================
-- 11. BẢNG STAFF_TASKS - Nhiệm vụ nhân viên
-- ================================================
DROP TABLE IF EXISTS staff_tasks;
CREATE TABLE staff_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assigned_to INT NOT NULL,
    assigned_by INT NULL,
    task_type ENUM('cleaning', 'maintenance', 'check_in', 'check_out', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    room_id INT NULL,
    booking_id INT NULL,
    due_date DATETIME,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_assigned_by (assigned_by),
    INDEX idx_task_type (task_type),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_room_id (room_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at),
    INDEX idx_status_priority (status, priority)
);

-- ================================================
-- 12. BẢNG ATTENDANCE_LOGS - Chấm công
-- ================================================
DROP TABLE IF EXISTS attendance_logs;
CREATE TABLE attendance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    shift_id INT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP NULL,
    work_hours DECIMAL(4,2) NULL,
    status ENUM('on_time', 'late', 'early_leave', 'absent') DEFAULT 'on_time',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES work_shifts(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_staff_id (staff_id),
    INDEX idx_shift_id (shift_id),
    INDEX idx_check_in_time (check_in_time),
    INDEX idx_status (status),
    INDEX idx_staff_checkin_date (staff_id, check_in_time)
);

-- ================================================
-- 13. BẢNG STAFF_PERMISSIONS - Quyền hạn chi tiết
-- ================================================
DROP TABLE IF EXISTS staff_permissions;
CREATE TABLE staff_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    permission_type ENUM('booking_management', 'room_management', 'customer_service', 'reports', 'system_admin') NOT NULL,
    can_create BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT TRUE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_staff_id (staff_id),
    INDEX idx_permission_type (permission_type),
    
    -- Unique constraint
    UNIQUE KEY unique_staff_permission (staff_id, permission_type)
);

-- ================================================
-- EMPLOYEE MODULE SAMPLE DATA
-- ================================================

-- Insert staff profiles for existing staff users
INSERT INTO staff_profiles (user_id, employee_id, department, position, hire_date, salary, work_schedule, permissions, status) VALUES
-- Staff 1 (user_id = 2 from existing data)
(2, 'EMP001', 'reception', 'Receptionist', '2024-01-01', 12000000.00, 
 JSON_OBJECT('monday', '08:00-17:00', 'tuesday', '08:00-17:00', 'wednesday', '08:00-17:00', 'thursday', '08:00-17:00', 'friday', '08:00-17:00', 'saturday', 'off', 'sunday', 'off'),
 JSON_OBJECT('booking_management', true, 'customer_service', true, 'reports', false),
 'active'),

-- Staff 2 (user_id = 3 from existing data)
(3, 'EMP002', 'housekeeping', 'Housekeeping Supervisor', '2024-01-01', 10000000.00,
 JSON_OBJECT('monday', '06:00-14:00', 'tuesday', '06:00-14:00', 'wednesday', '06:00-14:00', 'thursday', '06:00-14:00', 'friday', '06:00-14:00', 'saturday', '06:00-14:00', 'sunday', 'off'),
 JSON_OBJECT('room_management', true, 'task_assignment', true),
 'active');

-- Insert sample work shifts for this week
INSERT INTO work_shifts (staff_id, shift_date, shift_type, start_time, end_time, status) VALUES
-- Staff 1 shifts
(2, CURDATE(), 'full_day', '08:00:00', '17:00:00', 'scheduled'),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'full_day', '08:00:00', '17:00:00', 'scheduled'),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'full_day', '08:00:00', '17:00:00', 'scheduled'),

-- Staff 2 shifts
(3, CURDATE(), 'morning', '06:00:00', '14:00:00', 'scheduled'),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'morning', '06:00:00', '14:00:00', 'scheduled'),
(3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'morning', '06:00:00', '14:00:00', 'scheduled');

-- Insert sample tasks
INSERT INTO staff_tasks (assigned_to, assigned_by, task_type, title, description, priority, status, room_id, due_date) VALUES
-- Tasks for Staff 1 (Reception)
(2, 1, 'check_in', 'Check-in khách phòng 201', 'Hỗ trợ khách hàng check-in và hướng dẫn sử dụng dịch vụ', 'medium', 'pending', 3, DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(2, 1, 'other', 'Cập nhật thông tin booking', 'Cập nhật thông tin các booking mới và xác nhận với khách hàng', 'high', 'in_progress', NULL, DATE_ADD(NOW(), INTERVAL 4 HOUR)),

-- Tasks for Staff 2 (Housekeeping)
(3, 1, 'cleaning', 'Dọn dẹp phòng 102', 'Dọn dẹp và chuẩn bị phòng cho khách mới', 'high', 'pending', 2, DATE_ADD(NOW(), INTERVAL 1 HOUR)),
(3, 1, 'maintenance', 'Kiểm tra điều hòa phòng 301', 'Kiểm tra và bảo trì hệ thống điều hòa', 'medium', 'pending', 6, DATE_ADD(NOW(), INTERVAL 6 HOUR));

-- Insert sample attendance logs
INSERT INTO attendance_logs (staff_id, shift_id, check_in_time, check_out_time, work_hours, status) VALUES
-- Yesterday's attendance
(2, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 17 HOUR, 9.00, 'on_time'),
(3, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 6 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 8.00, 'on_time');

-- Insert staff permissions
INSERT INTO staff_permissions (staff_id, permission_type, can_create, can_read, can_update, can_delete) VALUES
-- Staff 1 permissions (Reception)
(2, 'booking_management', TRUE, TRUE, TRUE, FALSE),
(2, 'customer_service', TRUE, TRUE, TRUE, FALSE),
(2, 'reports', FALSE, TRUE, FALSE, FALSE),

-- Staff 2 permissions (Housekeeping)
(3, 'room_management', FALSE, TRUE, TRUE, FALSE),
(3, 'booking_management', FALSE, TRUE, FALSE, FALSE);

-- ================================================
-- EMPLOYEE MODULE VIEWS
-- ================================================

-- View: Staff overview with comprehensive information
DROP VIEW IF EXISTS staff_overview;
CREATE VIEW staff_overview AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    sp.employee_id,
    sp.department,
    sp.position,
    sp.hire_date,
    sp.salary,
    sp.status,
    COUNT(DISTINCT ws.id) as total_shifts,
    COUNT(DISTINCT st.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN st.status = 'completed' THEN st.id END) as completed_tasks,
    AVG(sr.total_revenue) as avg_daily_revenue,
    MAX(al.check_in_time) as last_check_in
FROM users u
LEFT JOIN staff_profiles sp ON u.id = sp.user_id
LEFT JOIN work_shifts ws ON u.id = ws.staff_id
LEFT JOIN staff_tasks st ON u.id = st.assigned_to
LEFT JOIN staff_reports sr ON u.id = sr.staff_id
LEFT JOIN attendance_logs al ON u.id = al.staff_id
WHERE u.role = 'staff'
GROUP BY u.id, u.email, u.full_name, u.phone, sp.employee_id, sp.department, sp.position, sp.hire_date, sp.salary, sp.status;

-- View: Monthly staff performance
DROP VIEW IF EXISTS monthly_staff_performance;
CREATE VIEW monthly_staff_performance AS
SELECT 
    u.id as staff_id,
    u.full_name,
    sp.department,
    sp.position,
    YEAR(sr.report_date) as year,
    MONTH(sr.report_date) as month,
    SUM(sr.checkins_count) as total_checkins,
    SUM(sr.checkouts_count) as total_checkouts,
    SUM(sr.total_revenue) as total_revenue,
    COUNT(sr.id) as working_days,
    AVG(al.work_hours) as avg_work_hours
FROM users u
JOIN staff_profiles sp ON u.id = sp.user_id
LEFT JOIN staff_reports sr ON u.id = sr.staff_id
LEFT JOIN attendance_logs al ON u.id = al.staff_id AND YEAR(al.check_in_time) = YEAR(sr.report_date) AND MONTH(al.check_in_time) = MONTH(sr.report_date)
WHERE u.role = 'staff'
GROUP BY u.id, u.full_name, sp.department, sp.position, YEAR(sr.report_date), MONTH(sr.report_date);

-- View: Daily task summary
DROP VIEW IF EXISTS daily_task_summary;
CREATE VIEW daily_task_summary AS
SELECT 
    DATE(st.created_at) as task_date,
    st.assigned_to as staff_id,
    u.full_name as staff_name,
    sp.department,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN st.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN st.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN st.status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN st.priority = 'urgent' THEN 1 END) as urgent_tasks,
    COUNT(CASE WHEN st.due_date < NOW() AND st.status != 'completed' THEN 1 END) as overdue_tasks
FROM staff_tasks st
JOIN users u ON st.assigned_to = u.id
JOIN staff_profiles sp ON u.id = sp.user_id
GROUP BY DATE(st.created_at), st.assigned_to, u.full_name, sp.department;

-- View: Attendance summary
DROP VIEW IF EXISTS attendance_summary;
CREATE VIEW attendance_summary AS
SELECT 
    al.staff_id,
    u.full_name as staff_name,
    sp.department,
    DATE(al.check_in_time) as attendance_date,
    al.check_in_time,
    al.check_out_time,
    al.work_hours,
    al.status,
    ws.shift_type,
    CASE 
        WHEN al.status = 'late' THEN 'Late Arrival'
        WHEN al.status = 'early_leave' THEN 'Early Departure'
        WHEN al.status = 'absent' THEN 'Absent'
        ELSE 'Normal'
    END as attendance_status
FROM attendance_logs al
JOIN users u ON al.staff_id = u.id
JOIN staff_profiles sp ON u.id = sp.user_id
LEFT JOIN work_shifts ws ON al.shift_id = ws.id
ORDER BY al.check_in_time DESC;

-- ================================================
-- EMPLOYEE MODULE TRIGGERS
-- ================================================

-- Trigger: Prevent duplicate attendance check-ins on same date
DROP TRIGGER IF EXISTS prevent_duplicate_checkin;
DELIMITER //
CREATE TRIGGER prevent_duplicate_checkin
BEFORE INSERT ON attendance_logs
FOR EACH ROW
BEGIN
    DECLARE existing_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO existing_count
    FROM attendance_logs 
    WHERE staff_id = NEW.staff_id 
    AND DATE(check_in_time) = DATE(NEW.check_in_time);
    
    IF existing_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Staff member already has attendance record for this date';
    END IF;
END //
DELIMITER ;

-- ================================================
-- EMPLOYEE MODULE STORED PROCEDURES
-- ================================================

-- Procedure: Get staff workload
DROP PROCEDURE IF EXISTS GetStaffWorkload;
DELIMITER //
CREATE PROCEDURE GetStaffWorkload(
    IN staff_id_param INT,
    IN date_from DATE,
    IN date_to DATE
)
BEGIN
    SELECT 
        DATE(st.created_at) as date,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN st.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN st.priority = 'urgent' THEN 1 END) as urgent_tasks,
        AVG(CASE WHEN st.completed_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, st.created_at, st.completed_at) 
            END) as avg_completion_hours
    FROM staff_tasks st
    WHERE st.assigned_to = staff_id_param
    AND DATE(st.created_at) BETWEEN date_from AND date_to
    GROUP BY DATE(st.created_at)
    ORDER BY DATE(st.created_at);
END //
DELIMITER ;

-- Procedure: Get department performance
DROP PROCEDURE IF EXISTS GetDepartmentPerformance;
DELIMITER //
CREATE PROCEDURE GetDepartmentPerformance(
    IN department_param VARCHAR(50),
    IN month_param INT,
    IN year_param INT
)
BEGIN
    SELECT 
        u.full_name,
        sp.position,
        COUNT(DISTINCT st.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN st.status = 'completed' THEN st.id END) as completed_tasks,
        ROUND(COUNT(DISTINCT CASE WHEN st.status = 'completed' THEN st.id END) * 100.0 / COUNT(DISTINCT st.id), 2) as completion_rate,
        SUM(DISTINCT al.work_hours) as total_work_hours,
        COUNT(DISTINCT al.id) as attendance_days
    FROM users u
    JOIN staff_profiles sp ON u.id = sp.user_id
    LEFT JOIN staff_tasks st ON u.id = st.assigned_to 
        AND MONTH(st.created_at) = month_param 
        AND YEAR(st.created_at) = year_param
    LEFT JOIN attendance_logs al ON u.id = al.staff_id 
        AND MONTH(al.check_in_time) = month_param 
        AND YEAR(al.check_in_time) = year_param
    WHERE sp.department = department_param
    AND u.role = 'staff'
    GROUP BY u.id, u.full_name, sp.position
    ORDER BY completion_rate DESC, total_work_hours DESC;
END //
DELIMITER ;

-- Show created tables and views
SHOW TABLES;

-- ================================================
-- FINAL STATISTICS WITH EMPLOYEE MODULE
-- ================================================
SELECT 'Database Setup Complete with Employee Module!' as Status;
SELECT COUNT(*) as Total_Users FROM users;
SELECT COUNT(*) as Total_Staff FROM users WHERE role = 'staff';
SELECT COUNT(*) as Total_Staff_Profiles FROM staff_profiles;
SELECT COUNT(*) as Total_Rooms FROM rooms;
SELECT COUNT(*) as Total_Bookings FROM bookings;
SELECT COUNT(*) as Completed_Bookings FROM bookings WHERE status = 'completed';
SELECT COUNT(*) as Total_Reviews FROM reviews;
SELECT COUNT(*) as Total_Services FROM services;
SELECT COUNT(*) as Total_Payments FROM payments;
SELECT COUNT(*) as Total_Work_Shifts FROM work_shifts;
SELECT COUNT(*) as Total_Staff_Tasks FROM staff_tasks;
SELECT COUNT(*) as Total_Attendance_Logs FROM attendance_logs;
SELECT COUNT(*) as Total_Staff_Permissions FROM staff_permissions;

-- ================================================
-- END OF COMPLETE DATABASE SETUP
-- ================================================


