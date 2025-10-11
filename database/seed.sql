-- ================================================
-- HOMESTAY MANAGEMENT SYSTEM - SAMPLE DATA
-- ================================================

USE homestay_db;

-- Disable foreign key checks for easier insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 1. SAMPLE USERS
-- ================================================

-- Admin user (password: admin123)
INSERT INTO users (email, password, full_name, phone, role, is_active) VALUES
('admin@homestay.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Quản trị viên', '0901234567', 'admin', TRUE);

-- Staff users (password: staff123)
INSERT INTO users (email, password, full_name, phone, role, is_active) VALUES
('staff1@homestay.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Nguyễn Văn An', '0901234568', 'staff', TRUE),
('staff2@homestay.com', '$2b$12$LQv3c1yqBwEHxPuNJBUCpOZpFw2hdHR4HpDH.7jdXpjsXpjsXpjsX', 'Trần Thị Bình', '0901234569', 'staff', TRUE);

-- Customer users (password: customer123)
INSERT INTO users (email, password, full_name, phone, role, is_active) VALUES
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
 '["room203_1.jpg", "room203_2.jpg"]', 'occupied'),

-- Suite rooms
('301', 'suite', 4, 1200000.00, 'Suite cao cấp với phòng khách riêng', 
 '["WiFi", "Điều hòa", "TV 55inch", "Tủ lạnh", "Phòng khách", "Ban công lớn", "Jacuzzi"]', 
 '["room301_1.jpg", "room301_2.jpg", "room301_3.jpg", "room301_4.jpg"]', 'available'),

('302', 'suite', 4, 1150000.00, 'Suite view núi với bếp nhỏ', 
 '["WiFi", "Điều hòa", "TV", "Tủ lạnh", "Bếp nhỏ", "Phòng khách", "Ban công"]', 
 '["room302_1.jpg", "room302_2.jpg", "room302_3.jpg"]', 'available'),

-- Family rooms
('401', 'family', 6, 1500000.00, 'Phòng gia đình lớn với 2 phòng ngủ', 
 '["WiFi", "Điều hòa", "2 TV", "Tủ lạnh lớn", "Bếp", "Phòng khách", "2 Ban công"]', 
 '["room401_1.jpg", "room401_2.jpg", "room401_3.jpg", "room401_4.jpg"]', 'available'),

('402', 'family', 8, 1800000.00, 'Phòng gia đình VIP với 3 phòng ngủ', 
 '["WiFi", "Điều hòa", "3 TV", "Tủ lạnh lớn", "Bếp đầy đủ", "Phòng khách lớn", "Sân hiên"]', 
 '["room402_1.jpg", "room402_2.jpg", "room402_3.jpg", "room402_4.jpg", "room402_5.jpg"]', 'available'),

('103', 'single', 1, 480000.00, 'Phòng đơn view vườn', 
 '["WiFi", "Điều hòa", "TV", "Ban công view vườn"]', 
 '["room103_1.jpg", "room103_2.jpg"]', 'maintenance');

-- ================================================
-- 3. SAMPLE SERVICES
-- ================================================

INSERT INTO services (name, description, price, category, is_active) VALUES
-- Food services
('Bữa sáng buffet', 'Buffet sáng với các món Việt Nam và Âu', 150000.00, 'food', TRUE),
('Bữa trưa set menu', 'Set menu trưa với 3 món chính', 200000.00, 'food', TRUE),
('Bữa tối BBQ', 'Tiệc nướng ngoài trời với seafood', 350000.00, 'food', TRUE),
('Đồ uống welcome', 'Nước hoa quả tươi chào mừng', 50000.00, 'food', TRUE),

-- Tour services  
('Tour thành phố 1 ngày', 'Tham quan các điểm nổi tiếng trong thành phố', 500000.00, 'tour', TRUE),
('Tour núi 2 ngày 1 đêm', 'Trekking và cắm trại trên núi', 1200000.00, 'tour', TRUE),
('Tour biển nửa ngày', 'Tham quan bãi biển và các hoạt động water sport', 300000.00, 'tour', TRUE),
('Tour làng nghề', 'Tham quan và trải nghiệm làng nghề truyền thống', 250000.00, 'tour', TRUE),

-- Transport services
('Đưa đón sân bay', 'Dịch vụ đưa đón từ/đến sân bay', 200000.00, 'transport', TRUE),
('Thuê xe máy', 'Thuê xe máy theo ngày', 100000.00, 'transport', TRUE),
('Thuê xe đạp', 'Thuê xe đạp để khám phá xung quanh', 50000.00, 'transport', TRUE),
('Thuê ô tô 4 chỗ', 'Thuê xe ô tô có tài xế', 800000.00, 'transport', TRUE),

-- Other services
('Massage thư giãn', 'Dịch vụ massage thư giãn tại phòng', 300000.00, 'other', TRUE),
('Giặt ủi', 'Dịch vụ giặt ủi quần áo', 80000.00, 'other', TRUE),
('Late check-out', 'Trả phòng muộn đến 18h', 100000.00, 'other', TRUE),
('Early check-in', 'Nhận phòng sớm từ 12h', 100000.00, 'other', TRUE);

-- ================================================
-- 4. SAMPLE BOOKINGS
-- ================================================

-- Booking 1: Customer 1 - Room 201 (confirmed)
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
(5, 9, '2024-01-22', '2024-01-25', 2, 3600000.00, 'completed', 'Honeymoon suite');

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
(3, 1170000.00, 'cash', 'completed', NULL, 'Thanh toán tiền cọc bằng tiền mặt');

-- Payment for booking 4 (pending)
INSERT INTO payments (booking_id, amount, payment_method, payment_status, notes) VALUES
(4, 4500000.00, 'vnpay', 'pending', 'Chờ xử lý thanh toán VNPay');

-- ================================================
-- 6. SAMPLE BOOKING SERVICES
-- ================================================

-- Services for booking 1
INSERT INTO booking_services (booking_id, service_id, quantity, price) VALUES
(1, 1, 6, 150000.00), -- Bữa sáng buffet x3 ngày x2 người
(1, 9, 1, 200000.00);  -- Đưa đón sân bay

-- Services for booking 2  
INSERT INTO booking_services (booking_id, service_id, quantity, price) VALUES
(2, 1, 9, 150000.00), -- Bữa sáng buffet x3 ngày x3 người
(2, 3, 3, 350000.00), -- Bữa tối BBQ x3 người
(2, 5, 3, 500000.00); -- Tour thành phố x3 người

-- Services for booking 3
INSERT INTO booking_services (booking_id, service_id, quantity, price) VALUES
(3, 1, 6, 150000.00), -- Bữa sáng buffet
(3, 13, 2, 300000.00); -- Massage thư giãn x2 người

-- ================================================
-- 7. SAMPLE REVIEWS
-- ================================================

INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES
(2, 5, 5, 'Dịch vụ tuyệt vời! Phòng sạch sẽ, nhân viên nhiệt tình. Sẽ quay lại lần sau.'),
(1, 4, 4, 'Phòng đẹp, view tốt. Chỉ có điều wifi hơi chậm. Nhìn chung rất hài lòng.'),
(3, 4, 5, 'Phòng tuyệt vời! View đẹp, sạch sẽ. Nhân viên phục vụ rất tốt.'),
(4, 5, 4, 'Phòng khá ổn, có điều wifi hơi chậm. Nhìn chung hài lòng.'),
(5, 4, 5, 'Dịch vụ xuất sắc! Phòng rộng rãi, tiện nghi đầy đủ.'),
(6, 5, 3, 'Phòng bình thường, giá cả hợp lý. Có thể cải thiện thêm.'),
(7, 4, 4, 'Vị trí tốt, phòng sạch sẽ. Sẽ quay lại lần sau.'),
(8, 5, 5, 'Trải nghiệm tuyệt vời! Homestay này rất đáng để ở.'),
(9, 4, 4, 'Phòng đẹp, view hồ bơi tuyệt vời. Chỉ có điều hơi ồn vào buổi tối.'),
(10, 5, 5, 'Phòng suite rất sang trọng! Dịch vụ hoàn hảo từ A-Z.');

-- ================================================
-- 8. SAMPLE STAFF REPORTS
-- ================================================

INSERT INTO staff_reports (staff_id, report_date, checkins_count, checkouts_count, total_revenue, notes) VALUES
(2, '2024-01-15', 2, 1, 2400000.00, 'Ngày bận rộn với nhiều khách check-in'),
(3, '2024-01-15', 1, 0, 0, 'Hỗ trợ khách hàng và dọn dẹp phòng'),
(2, '2024-01-16', 0, 1, 3600000.00, 'Khách check-out và thanh toán đầy đủ'),
(3, '2024-01-16', 1, 0, 0, 'Đón tiếp khách mới và hướng dẫn dịch vụ');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- VERIFY DATA
-- ================================================

-- Show summary of inserted data
SELECT 'Users' as Table_Name, COUNT(*) as Record_Count FROM users
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms  
UNION ALL
SELECT 'Services', COUNT(*) FROM services
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Booking Services', COUNT(*) FROM booking_services
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Staff Reports', COUNT(*) FROM staff_reports;

-- Show sample room availability
SELECT 
    room_number,
    room_type, 
    capacity,
    price_per_night,
    status
FROM rooms 
ORDER BY room_number;

-- Show current bookings
SELECT 
    b.id,
    u.full_name as customer,
    r.room_number,
    b.check_in_date,
    b.check_out_date,
    b.status,
    b.total_amount
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN rooms r ON b.room_id = r.id
ORDER BY b.created_at DESC;


-- Show current bookings
SELECT 
    b.id,
    u.full_name as customer,
    r.room_number,
    b.check_in_date,
    b.check_out_date,
    b.status,
    b.total_amount
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN rooms r ON b.room_id = r.id
ORDER BY b.created_at DESC;
