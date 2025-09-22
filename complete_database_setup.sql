-- ===============================================
-- COMPLETE DATABASE SETUP - HOMESTAY MANAGEMENT SYSTEM
-- File này gộp tất cả: create tables + role system + additional tables + sample data
-- ===============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS task0609;
USE task0609;

-- ===============================================
-- PHẦN 0: TẠO CÁC BẢNG CƠ BẢN
-- ===============================================

-- 1. BẢNG CUSTOMERS (Khách hàng)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    id_number VARCHAR(50),
    profile_image VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- 2. BẢNG ROOM_TYPES (Loại phòng)
CREATE TABLE IF NOT EXISTS room_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    max_occupancy INT NOT NULL DEFAULT 2,
    amenities JSON,
    images JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type_name (type_name),
    INDEX idx_status (status),
    INDEX idx_price (base_price)
);

-- 3. BẢNG ROOMS (Phòng)
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    type_id INT NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    description TEXT,
    floor_number INT,
    room_size DECIMAL(5,2),
    price_per_night DECIMAL(10,2) NOT NULL,
    weekend_price DECIMAL(10,2),
    holiday_price DECIMAL(10,2),
    amenities JSON,
    images JSON,
    view_type ENUM('sea', 'mountain', 'city', 'garden', 'pool') DEFAULT 'garden',
    bed_type ENUM('single', 'double', 'queen', 'king', 'twin') DEFAULT 'double',
    bathroom_type ENUM('private', 'shared') DEFAULT 'private',
    wifi_available BOOLEAN DEFAULT TRUE,
    ac_available BOOLEAN DEFAULT TRUE,
    tv_available BOOLEAN DEFAULT TRUE,
    fridge_available BOOLEAN DEFAULT FALSE,
    balcony_available BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    pet_allowed BOOLEAN DEFAULT FALSE,
    status ENUM('available', 'occupied', 'maintenance', 'out_of_order') DEFAULT 'available',
    cleaning_status ENUM('clean', 'dirty', 'cleaning') DEFAULT 'clean',
    last_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (type_id) REFERENCES room_types(type_id) ON DELETE RESTRICT,
    INDEX idx_room_number (room_number),
    INDEX idx_type_id (type_id),
    INDEX idx_status (status),
    INDEX idx_price (price_per_night),
    INDEX idx_floor (floor_number)
);

-- 4. BẢNG BOOKINGS (Đặt phòng)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_adults INT NOT NULL DEFAULT 1,
    num_children INT DEFAULT 0,
    total_nights INT NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    guest_notes TEXT,
    staff_notes TEXT,
    booking_source ENUM('website', 'phone', 'email', 'walk_in', 'third_party') DEFAULT 'website',
    booking_status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending',
    payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    cancelled_by INT NULL,
    confirmed_at TIMESTAMP NULL,
    confirmed_by INT NULL,
    checked_in_at TIMESTAMP NULL,
    checked_out_at TIMESTAMP NULL,
    checked_in_by INT,
    checked_out_by INT,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT,
    INDEX idx_booking_code (booking_code),
    INDEX idx_customer_id (customer_id),
    INDEX idx_room_id (room_id),
    INDEX idx_check_in (check_in_date),
    INDEX idx_check_out (check_out_date),
    INDEX idx_status (booking_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- 5. BẢNG PAYMENTS (Thanh toán)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    payment_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'momo', 'vnpay', 'paypal') NOT NULL,
    payment_type ENUM('full', 'deposit', 'partial', 'refund') DEFAULT 'full',
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_transaction_id VARCHAR(255),
    currency_code VARCHAR(3) DEFAULT 'VND',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    payment_date TIMESTAMP NULL,
    due_date TIMESTAMP NULL,
    description TEXT,
    payment_notes TEXT,
    failure_reason TEXT,
    momo_order_id VARCHAR(255),
    momo_request_id VARCHAR(255),
    momo_pay_url TEXT,
    momo_qr_code_url TEXT,
    momo_raw_response JSON,
    vnpay_txn_ref VARCHAR(255),
    vnpay_transaction_no VARCHAR(255),
    vnpay_bank_code VARCHAR(20),
    vnpay_raw_response JSON,
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    card_holder_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    INDEX idx_payment_code (payment_code),
    INDEX idx_booking_id (booking_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
);

-- 6. BẢNG REVIEWS (Đánh giá)
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    cleanliness_rating INT CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    service_rating INT CHECK (service_rating >= 1 AND service_rating <= 5),
    location_rating INT CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
    amenities_rating INT CHECK (amenities_rating >= 1 AND amenities_rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    pros TEXT,
    cons TEXT,
    images JSON,
    helpful_count INT DEFAULT 0,
    verified_stay BOOLEAN DEFAULT TRUE,
    review_status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'pending',
    admin_response TEXT,
    admin_response_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT,
    INDEX idx_booking_id (booking_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_room_id (room_id),
    INDEX idx_rating (rating),
    INDEX idx_status (review_status),
    INDEX idx_created_at (created_at)
);

-- 7. BẢNG ADDITIONAL_SERVICES (Dịch vụ thêm)
CREATE TABLE IF NOT EXISTS additional_services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(255) NOT NULL,
    service_type ENUM('food', 'transport', 'tour', 'spa', 'laundry', 'other') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit ENUM('per_person', 'per_room', 'per_hour', 'per_day', 'fixed') DEFAULT 'fixed',
    availability_hours JSON,
    advance_booking_required INT DEFAULT 0,
    max_quantity INT DEFAULT 10,
    images JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_name (service_name),
    INDEX idx_service_type (service_type),
    INDEX idx_status (status)
);

-- 8. BẢNG BOOKING_SERVICES (Dịch vụ đã đặt)
CREATE TABLE IF NOT EXISTS booking_services (
    booking_service_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    service_date DATE,
    service_time TIME,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES additional_services(service_id) ON DELETE RESTRICT,
    INDEX idx_booking_id (booking_id),
    INDEX idx_service_id (service_id),
    INDEX idx_service_date (service_date)
);

-- 9. BẢNG ROOM_AVAILABILITY (Tình trạng phòng)
CREATE TABLE IF NOT EXISTS room_availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('available', 'booked', 'maintenance', 'blocked') DEFAULT 'available',
    price_override DECIMAL(10,2),
    min_stay INT DEFAULT 1,
    max_stay INT DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_date (room_id, date),
    INDEX idx_room_id (room_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- 10. BẢNG CUSTOMER_PREFERENCES (Sở thích khách hàng)
CREATE TABLE IF NOT EXISTS customer_preferences (
    preference_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    preferred_room_type VARCHAR(100),
    preferred_floor ENUM('low', 'middle', 'high'),
    preferred_view VARCHAR(50),
    special_needs TEXT,
    dietary_requirements TEXT,
    communication_preferences JSON,
    marketing_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
);

-- 11. BẢNG PROMOCODES (Mã khuyến mãi)
CREATE TABLE IF NOT EXISTS promocodes (
    promo_id INT PRIMARY KEY AUTO_INCREMENT,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    promo_name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT DEFAULT 1,
    usage_count INT DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    applicable_room_types JSON,
    applicable_days JSON,
    customer_usage_limit INT DEFAULT 1,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_promo_code (promo_code),
    INDEX idx_valid_from (valid_from),
    INDEX idx_valid_to (valid_to),
    INDEX idx_status (status)
);

-- 12. BẢNG CUSTOMER_PROMOCODE_USAGE (Sử dụng mã khuyến mãi)
CREATE TABLE IF NOT EXISTS customer_promocode_usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    promo_id INT NOT NULL,
    booking_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (promo_id) REFERENCES promocodes(promo_id) ON DELETE RESTRICT,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_promo_id (promo_id),
    INDEX idx_booking_id (booking_id)
);

-- ===============================================
-- PHẦN 1: HỆ THỐNG PHÂN QUYỀN (ROLE SYSTEM)
-- ===============================================

-- 1. Thêm role field vào bảng customers
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'customers' 
AND COLUMN_NAME = 'role';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE customers ADD COLUMN role ENUM(''customer'', ''staff'', ''admin'') DEFAULT ''customer'' AFTER status', 
  'SELECT "Column role already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Tạo index cho role field
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'customers' 
AND INDEX_NAME = 'idx_customer_role';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_customer_role ON customers(role)', 
  'SELECT "Index idx_customer_role already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Tạo bảng employees cho staff management
CREATE TABLE IF NOT EXISTS employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT UNIQUE NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    position ENUM('receptionist', 'manager', 'housekeeping', 'maintenance') NOT NULL,
    department VARCHAR(100) DEFAULT 'Operations',
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    shift_type ENUM('morning', 'afternoon', 'night', 'flexible') DEFAULT 'flexible',
    permissions JSON,
    supervisor_id INT,
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_employee_code (employee_code),
    INDEX idx_position (position),
    INDEX idx_department (department),
    INDEX idx_status (status)
);

-- 4. Tạo bảng work_shifts cho quản lý ca làm việc
CREATE TABLE IF NOT EXISTS work_shifts (
    shift_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INT DEFAULT 60, -- phút
    tasks JSON,
    notes TEXT,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    INDEX idx_employee_date (employee_id, shift_date),
    INDEX idx_shift_date (shift_date),
    INDEX idx_status (status)
);

-- 5. Tạo bảng daily_reports cho báo cáo hàng ngày
CREATE TABLE IF NOT EXISTS daily_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    report_date DATE NOT NULL,
    shift_type ENUM('morning', 'afternoon', 'night') NOT NULL,
    check_ins_count INT DEFAULT 0,
    check_outs_count INT DEFAULT 0,
    room_issues JSON,
    guest_feedback JSON,
    maintenance_requests JSON,
    revenue_summary JSON,
    notes TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(employee_id) ON DELETE SET NULL,
    UNIQUE KEY unique_employee_date_shift (employee_id, report_date, shift_type),
    INDEX idx_report_date (report_date),
    INDEX idx_status (status)
);

-- 6. Cập nhật bảng bookings để hỗ trợ staff operations
-- Thêm cột checked_in_by
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'checked_in_by';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE bookings ADD COLUMN checked_in_by INT AFTER booking_status', 
  'SELECT "Column checked_in_by already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm cột checked_out_by
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'checked_out_by';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE bookings ADD COLUMN checked_out_by INT AFTER checked_in_by', 
  'SELECT "Column checked_out_by already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm cột check_in_time
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'check_in_time';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE bookings ADD COLUMN check_in_time TIMESTAMP NULL AFTER checked_in_by', 
  'SELECT "Column check_in_time already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm cột check_out_time
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'check_out_time';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE bookings ADD COLUMN check_out_time TIMESTAMP NULL AFTER checked_out_by', 
  'SELECT "Column check_out_time already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Thêm foreign keys (kiểm tra trước khi thêm)
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'checked_in_by'
AND REFERENCED_TABLE_NAME = 'employees';

SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE bookings ADD FOREIGN KEY (checked_in_by) REFERENCES employees(employee_id) ON DELETE SET NULL', 
  'SELECT "Foreign key for checked_in_by already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'checked_out_by'
AND REFERENCED_TABLE_NAME = 'employees';

SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE bookings ADD FOREIGN KEY (checked_out_by) REFERENCES employees(employee_id) ON DELETE SET NULL', 
  'SELECT "Foreign key for checked_out_by already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Thêm indexes cho performance
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND INDEX_NAME = 'idx_booking_checkin_staff';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_booking_checkin_staff ON bookings(checked_in_by)', 
  'SELECT "Index idx_booking_checkin_staff already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND INDEX_NAME = 'idx_booking_checkout_staff';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_booking_checkout_staff ON bookings(checked_out_by)', 
  'SELECT "Index idx_booking_checkout_staff already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND INDEX_NAME = 'idx_booking_checkin_time';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_booking_checkin_time ON bookings(check_in_time)', 
  'SELECT "Index idx_booking_checkin_time already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND INDEX_NAME = 'idx_booking_checkout_time';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_booking_checkout_time ON bookings(check_out_time)', 
  'SELECT "Index idx_booking_checkout_time already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===============================================
-- PHẦN 2: CÁC BẢNG BỔ SUNG CHO HỆ THỐNG QUẢN LÝ
-- ===============================================

-- 1. Bảng admin_actions - Lưu lại các hành động của admin
CREATE TABLE IF NOT EXISTS admin_actions (
    action_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM('create', 'update', 'delete', 'status_change', 'approve', 'reject') NOT NULL,
    target_type ENUM('customer', 'employee', 'room', 'booking', 'payment', 'service') NOT NULL,
    target_id INT NOT NULL,
    reason TEXT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_target_type_id (target_type, target_id),
    INDEX idx_created_at (created_at)
);

-- 2. Bảng booking_activities - Lưu lại các hoạt động liên quan đến booking
CREATE TABLE IF NOT EXISTS booking_activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    employee_id INT,
    activity_type ENUM('created', 'approved', 'cancelled', 'checked_in', 'checked_out', 'modified', 'payment_updated') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- 3. Bảng room_activities - Lưu lại các hoạt động liên quan đến phòng
CREATE TABLE IF NOT EXISTS room_activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    employee_id INT,
    activity_type ENUM('status_change', 'maintenance', 'cleaning', 'inspection', 'repair') NOT NULL,
    notes TEXT,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_room_id (room_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- 4. Bảng maintenance_requests - Yêu cầu bảo trì
CREATE TABLE IF NOT EXISTS maintenance_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    reported_by INT NOT NULL,
    assigned_to INT,
    issue_type ENUM('plumbing', 'electrical', 'cleaning', 'furniture', 'appliance', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    description TEXT NOT NULL,
    estimated_time INT, -- phút
    actual_time INT, -- phút
    cost DECIMAL(10,2),
    images JSON,
    notes TEXT,
    status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES employees(employee_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_room_id (room_id),
    INDEX idx_reported_by (reported_by),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 5. Bảng service_requests - Yêu cầu dịch vụ từ khách
CREATE TABLE IF NOT EXISTS service_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    requested_time DATETIME,
    special_instructions TEXT,
    assigned_to INT,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES additional_services(service_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_service_id (service_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_requested_time (requested_time)
);

-- 6. Bảng inventory - Quản lý kho
CREATE TABLE IF NOT EXISTS inventory (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(50) UNIQUE,
    category ENUM('cleaning', 'amenities', 'furniture', 'electronics', 'linens', 'food', 'other') NOT NULL,
    description TEXT,
    unit ENUM('piece', 'set', 'bottle', 'pack', 'kg', 'liter') NOT NULL,
    current_stock INT DEFAULT 0,
    minimum_stock INT DEFAULT 5,
    unit_cost DECIMAL(10,2),
    supplier_info JSON,
    location VARCHAR(100),
    status ENUM('active', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_item_code (item_code),
    INDEX idx_category (category),
    INDEX idx_current_stock (current_stock),
    INDEX idx_status (status)
);

-- 7. Bảng inventory_transactions - Giao dịch kho
CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    employee_id INT,
    transaction_type ENUM('in', 'out', 'adjustment', 'damaged', 'expired') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    reference_type ENUM('booking', 'maintenance', 'purchase', 'manual') NOT NULL,
    reference_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES inventory(item_id) ON DELETE RESTRICT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_item_id (item_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_created_at (created_at)
);

-- 8. Bảng guest_feedback - Phản hồi từ khách
CREATE TABLE IF NOT EXISTS guest_feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    feedback_type ENUM('compliment', 'suggestion', 'complaint', 'general') NOT NULL,
    category ENUM('room', 'service', 'staff', 'facility', 'food', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    images JSON,
    status ENUM('new', 'acknowledged', 'resolved', 'closed') DEFAULT 'new',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    assigned_to INT,
    response TEXT,
    responded_by INT,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

-- ===============================================
-- PHẦN 3: INDEXES BỔ SUNG CHO PERFORMANCE
-- ===============================================

-- Composite indexes cho reporting
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND INDEX_NAME = 'idx_bookings_revenue_report';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_bookings_revenue_report ON bookings(created_at, payment_status, total_amount)', 
  'SELECT "Index idx_bookings_revenue_report already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'bookings' 
AND INDEX_NAME = 'idx_bookings_occupancy_report';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_bookings_occupancy_report ON bookings(check_in_date, check_out_date, booking_status)', 
  'SELECT "Index idx_bookings_occupancy_report already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Indexes cho search và filter
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'customers' 
AND INDEX_NAME = 'idx_customers_search';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_customers_search ON customers(full_name, email, phone, role, status)', 
  'SELECT "Index idx_customers_search already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'employees' 
AND INDEX_NAME = 'idx_employees_search';

SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_employees_search ON employees(employee_code, position, department, status)', 
  'SELECT "Index idx_employees_search already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===============================================
-- PHẦN 4: VIEWS CHO REPORTING
-- ===============================================

-- View: Staff performance summary
CREATE OR REPLACE VIEW staff_performance_summary AS
SELECT 
    e.employee_id,
    e.employee_code,
    c.full_name,
    e.position,
    e.department,
    COUNT(DISTINCT dr.report_id) as total_reports,
    COUNT(DISTINCT b.booking_id) as total_checkins,
    AVG(CASE WHEN dr.status = 'approved' THEN 1 ELSE 0 END) as approval_rate,
    e.status as employee_status
FROM employees e
JOIN customers c ON e.customer_id = c.customer_id
LEFT JOIN daily_reports dr ON e.employee_id = dr.employee_id
LEFT JOIN bookings b ON e.employee_id = b.checked_in_by
WHERE e.status = 'active'
GROUP BY e.employee_id, e.employee_code, c.full_name, e.position, e.department, e.status;

-- View: Daily operations summary
CREATE OR REPLACE VIEW daily_operations_summary AS
SELECT 
    DATE(b.check_in_time) as operation_date,
    COUNT(DISTINCT CASE WHEN b.check_in_time IS NOT NULL THEN b.booking_id END) as checkins_count,
    COUNT(DISTINCT CASE WHEN b.check_out_time IS NOT NULL THEN b.booking_id END) as checkouts_count,
    COUNT(DISTINCT b.checked_in_by) as active_staff_checkin,
    COUNT(DISTINCT b.checked_out_by) as active_staff_checkout,
    SUM(b.total_amount) as daily_revenue
FROM bookings b
WHERE DATE(b.check_in_time) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
   OR DATE(b.check_out_time) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(b.check_in_time)
ORDER BY operation_date DESC;

-- View: Monthly revenue by room type
CREATE OR REPLACE VIEW monthly_revenue_by_room_type AS
SELECT 
    YEAR(b.created_at) as year,
    MONTH(b.created_at) as month,
    rt.type_name,
    COUNT(b.booking_id) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount) as average_booking_value
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
JOIN room_types rt ON r.type_id = rt.type_id
WHERE b.payment_status = 'paid'
GROUP BY YEAR(b.created_at), MONTH(b.created_at), rt.type_id, rt.type_name
ORDER BY year DESC, month DESC, total_revenue DESC;

-- View: Staff performance metrics
CREATE OR REPLACE VIEW staff_performance_metrics AS
SELECT 
    e.employee_id,
    e.employee_code,
    c.full_name,
    e.position,
    e.department,
    COUNT(DISTINCT ci.booking_id) as total_checkins,
    COUNT(DISTINCT co.booking_id) as total_checkouts,
    COUNT(DISTINCT dr.report_id) as total_reports,
    COUNT(DISTINCT mr.request_id) as maintenance_requests,
    AVG(CASE WHEN dr.status = 'approved' THEN 1 ELSE 0 END) as report_approval_rate
FROM employees e
JOIN customers c ON e.customer_id = c.customer_id
LEFT JOIN bookings ci ON e.employee_id = ci.checked_in_by
LEFT JOIN bookings co ON e.employee_id = co.checked_out_by
LEFT JOIN daily_reports dr ON e.employee_id = dr.employee_id
LEFT JOIN maintenance_requests mr ON e.employee_id = mr.reported_by
WHERE e.status = 'active'
GROUP BY e.employee_id, e.employee_code, c.full_name, e.position, e.department;

-- View: Customer value analysis
CREATE OR REPLACE VIEW customer_value_analysis AS
SELECT 
    c.customer_id,
    c.full_name,
    c.email,
    c.created_at as registration_date,
    COUNT(b.booking_id) as total_bookings,
    SUM(b.total_amount) as total_spent,
    AVG(b.total_amount) as average_booking_value,
    MAX(b.created_at) as last_booking_date,
    DATEDIFF(CURDATE(), MAX(b.created_at)) as days_since_last_booking,
    COUNT(r.review_id) as total_reviews,
    AVG(r.rating) as average_rating
FROM customers c
LEFT JOIN bookings b ON c.customer_id = b.customer_id AND b.payment_status = 'paid'
LEFT JOIN reviews r ON b.booking_id = r.booking_id
WHERE c.role = 'customer'
GROUP BY c.customer_id, c.full_name, c.email, c.created_at
ORDER BY total_spent DESC;

-- ===============================================
-- PHẦN 5: TRIGGERS
-- ===============================================

-- Trigger: Auto generate employee code
DROP TRIGGER IF EXISTS before_employee_insert;

DELIMITER //
CREATE TRIGGER before_employee_insert 
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
        SET NEW.employee_code = CONCAT('EMP', LPAD((SELECT COUNT(*) + 1 FROM employees), 3, '0'));
    END IF;
END//
DELIMITER ;

-- Trigger: Cập nhật stock khi có giao dịch inventory
DROP TRIGGER IF EXISTS after_inventory_transaction_insert;

DELIMITER //
CREATE TRIGGER after_inventory_transaction_insert 
AFTER INSERT ON inventory_transactions
FOR EACH ROW
BEGIN
    IF NEW.transaction_type = 'in' THEN
        UPDATE inventory SET current_stock = current_stock + NEW.quantity WHERE item_id = NEW.item_id;
    ELSEIF NEW.transaction_type IN ('out', 'damaged', 'expired') THEN
        UPDATE inventory SET current_stock = current_stock - NEW.quantity WHERE item_id = NEW.item_id;
    ELSEIF NEW.transaction_type = 'adjustment' THEN
        UPDATE inventory SET current_stock = NEW.quantity WHERE item_id = NEW.item_id;
    END IF;
END//
DELIMITER ;

-- Trigger: Tự động tạo inventory transaction khi booking hoàn thành
DROP TRIGGER IF EXISTS after_booking_checkout;

DELIMITER //
CREATE TRIGGER after_booking_checkout 
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.check_out_time IS NULL AND NEW.check_out_time IS NOT NULL THEN
        -- Tự động trừ amenities khi khách checkout (nếu có item_id = 1)
        INSERT IGNORE INTO inventory_transactions (item_id, transaction_type, quantity, reason, reference_type, reference_id)
        SELECT 1, 'out', 1, 'Room checkout - amenities used', 'booking', NEW.booking_id
        WHERE EXISTS (SELECT 1 FROM inventory WHERE item_id = 1);
    END IF;
END//
DELIMITER ;

-- ===============================================
-- PHẦN 6: STORED PROCEDURES
-- ===============================================

-- Procedure: Tính toán occupancy rate
DROP PROCEDURE IF EXISTS CalculateOccupancyRate;

DELIMITER //
CREATE PROCEDURE CalculateOccupancyRate(
    IN start_date DATE,
    IN end_date DATE,
    OUT occupancy_rate DECIMAL(5,2)
)
BEGIN
    DECLARE total_room_days INT;
    DECLARE occupied_room_days INT;
    
    SELECT 
        COUNT(*) * (DATEDIFF(end_date, start_date) + 1) INTO total_room_days
    FROM rooms;
    
    SELECT 
        COUNT(*) INTO occupied_room_days
    FROM room_availability
    WHERE date BETWEEN start_date AND end_date
      AND status = 'booked';
    
    IF total_room_days > 0 THEN
        SET occupancy_rate = (occupied_room_days * 100.0 / total_room_days);
    ELSE
        SET occupancy_rate = 0;
    END IF;
END//
DELIMITER ;

-- ===============================================
-- PHẦN 6.5: ADDITIONAL SERVICES & REVIEWS TABLES
-- ===============================================

-- Additional Services Table
CREATE TABLE IF NOT EXISTS additional_services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(255) NOT NULL,
    service_type ENUM('food', 'transport', 'tour', 'spa', 'laundry', 'other') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit ENUM('per_person', 'per_room', 'per_hour', 'per_day', 'fixed') DEFAULT 'fixed',
    availability_hours JSON,
    advance_booking_required INT DEFAULT 0 COMMENT 'Hours in advance',
    max_quantity INT DEFAULT 10,
    images JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_price (price)
);

-- Booking Services Junction Table  
CREATE TABLE IF NOT EXISTS booking_services (
    booking_service_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    service_date DATE,
    service_time TIME,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES additional_services(service_id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_service_id (service_id),
    INDEX idx_status (status),
    INDEX idx_service_date (service_date)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    cleanliness_rating DECIMAL(2,1) CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    service_rating DECIMAL(2,1) CHECK (service_rating >= 1 AND service_rating <= 5),
    location_rating DECIMAL(2,1) CHECK (location_rating >= 1 AND location_rating <= 5),
    value_rating DECIMAL(2,1) CHECK (value_rating >= 1 AND value_rating <= 5),
    amenities_rating DECIMAL(2,1) CHECK (amenities_rating >= 1 AND amenities_rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    pros TEXT,
    cons TEXT,
    images JSON,
    helpful_count INT DEFAULT 0,
    verified_stay BOOLEAN DEFAULT TRUE,
    review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_response TEXT,
    admin_response_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_booking_review (booking_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_room_id (room_id),
    INDEX idx_rating (rating),
    INDEX idx_review_status (review_status),
    INDEX idx_created_at (created_at)
);

-- Seasonal Pricing Table
CREATE TABLE IF NOT EXISTS seasonal_pricing (
    season_pricing_id INT PRIMARY KEY AUTO_INCREMENT,
    type_id INT NOT NULL,
    season_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.00,
    holiday_multiplier DECIMAL(3,2) DEFAULT 1.00,
    min_stay_nights INT DEFAULT 1,
    max_stay_nights INT NULL,
    advance_booking_discount DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentage discount for advance booking',
    last_minute_surcharge DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentage surcharge for last-minute booking',
    priority INT DEFAULT 1 COMMENT 'Higher priority rules override lower priority',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (type_id) REFERENCES room_types(type_id) ON DELETE CASCADE,
    
    INDEX idx_type_id (type_id),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_season_name (season_name),
    
    CONSTRAINT chk_date_range CHECK (start_date <= end_date),
    CONSTRAINT chk_multipliers CHECK (weekend_multiplier >= 0 AND holiday_multiplier >= 0),
    CONSTRAINT chk_stay_nights CHECK (min_stay_nights >= 1 AND (max_stay_nights IS NULL OR max_stay_nights >= min_stay_nights))
);

-- ===============================================
-- PHẦN 7: DỮ LIỆU MẪU
-- ===============================================

-- Cập nhật role cho customers hiện tại (nếu chưa có role)
UPDATE customers SET role = 'customer' WHERE role IS NULL;

-- Tạo tài khoản admin (chỉ thêm nếu chưa tồn tại)
INSERT IGNORE INTO customers (full_name, email, phone, password_hash, role, status, email_verified) VALUES
('Admin System', 'admin@homestay.com', '0900000001', '$2b$10$vm9DpLsSGy8tkDVssXp0j.aD6RV.NCb1aZBOn/rHH444CC9k165T.', 'admin', 'active', TRUE),
('Manager Nguyễn Văn Quản Lý', 'manager@homestay.com', '0900000002', '$2b$10$jmDqsqNW1j/WO1hgxND1neTbxhjDW9EZY7ThK46R947JuCTjNLGTW', 'admin', 'active', TRUE);

-- Tạo tài khoản staff (chỉ thêm nếu chưa tồn tại)
INSERT IGNORE INTO customers (full_name, email, phone, password_hash, role, status, email_verified) VALUES
('Lễ Tân Trần Thị Mai', 'receptionist1@homestay.com', '0900000011', '$2b$10$2efAqevCVeJU4ISw5BDAQe35F6hwoND1jXgUPtHFTBAYYVnFV7N4i', 'staff', 'active', TRUE),
('Lễ Tân Lê Văn Nam', 'receptionist2@homestay.com', '0900000012', '$2b$10$2efAqevCVeJU4ISw5BDAQe35F6hwoND1jXgUPtHFTBAYYVnFV7N4i', 'staff', 'active', TRUE),
('Nhân Viên Phạm Thị Lan', 'housekeeping1@homestay.com', '0900000013', '$2b$10$2efAqevCVeJU4ISw5BDAQe35F6hwoND1jXgUPtHFTBAYYVnFV7N4i', 'staff', 'active', TRUE);

-- Tạo employee records cho staff (chỉ thêm nếu chưa tồn tại)
INSERT IGNORE INTO employees (customer_id, employee_code, position, hire_date, salary, shift_type, permissions) VALUES
((SELECT customer_id FROM customers WHERE email = 'receptionist1@homestay.com'), 'EMP001', 'receptionist', '2025-01-01', 8000000, 'morning', '["booking_management", "checkin_checkout", "customer_service"]'),
((SELECT customer_id FROM customers WHERE email = 'receptionist2@homestay.com'), 'EMP002', 'receptionist', '2025-01-01', 8000000, 'afternoon', '["booking_management", "checkin_checkout", "customer_service"]'),
((SELECT customer_id FROM customers WHERE email = 'housekeeping1@homestay.com'), 'EMP003', 'housekeeping', '2025-01-01', 6000000, 'morning', '["room_cleaning", "maintenance_report"]');

-- Sample inventory items (chỉ thêm nếu bảng trống)
INSERT IGNORE INTO inventory (item_name, item_code, category, description, unit, current_stock, minimum_stock, unit_cost) VALUES
('Khăn tắm lớn', 'TOWEL001', 'linens', 'Khăn tắm cotton cao cấp', 'piece', 50, 20, 150000),
('Khăn mặt', 'TOWEL002', 'linens', 'Khăn mặt cotton mềm mại', 'piece', 80, 30, 75000),
('Bộ ga giường đôi', 'BED001', 'linens', 'Bộ ga giường cotton 100%', 'set', 25, 10, 300000),
('Nước rửa chén', 'CLEAN001', 'cleaning', 'Nước rửa chén sinh học', 'bottle', 15, 5, 25000),
('Dầu gội', 'AMENITY001', 'amenities', 'Dầu gội thảo dược', 'bottle', 30, 10, 45000),
('Sữa tắm', 'AMENITY002', 'amenities', 'Sữa tắm dưỡng ẩm', 'bottle', 28, 10, 40000);

-- Sample additional services (chỉ thêm nếu bảng trống)
INSERT IGNORE INTO additional_services (service_name, service_type, description, price, unit, availability_hours, advance_booking_required, max_quantity, images) VALUES
('Bữa sáng châu Âu', 'food', 'Bữa sáng phong cách châu Âu với bánh mì, pho mát, trứng và trái cây tươi', 150000, 'per_person', '["06:00-10:00"]', 12, 10, '["breakfast.jpg"]'),
('Cơm trưa địa phương', 'food', 'Cơm trưa với các món ăn đặc sản địa phương', 200000, 'per_person', '["11:00-14:00"]', 2, 8, '["lunch.jpg"]'),
('Xe đưa đón sân bay', 'transport', 'Dịch vụ đưa đón từ sân bay đến homestay', 350000, 'per_room', '[]', 24, 1, '["airport-transfer.jpg"]'),
('Tour city ngày', 'tour', 'Tour tham quan thành phố cả ngày với hướng dẫn viên', 800000, 'per_person', '["08:00-17:00"]', 24, 6, '["city-tour.jpg"]'),
('Massage thư giãn', 'spa', 'Massage thư giãn toàn thân với tinh dầu thiên nhiên', 500000, 'per_person', '["09:00-21:00"]', 4, 2, '["massage.jpg"]'),
('Giặt ủi quần áo', 'laundry', 'Dịch vụ giặt ủi quần áo nhanh chóng', 50000, 'per_room', '["08:00-18:00"]', 2, 5, '["laundry.jpg"]'),
('Thuê xe máy', 'transport', 'Thuê xe máy theo ngày để tự khám phá', 150000, 'per_day', '["07:00-19:00"]', 4, 3, '["motorbike.jpg"]'),
('BBQ tối', 'food', 'Tiệc BBQ ngoài trời với hải sản và thịt nướng', 400000, 'per_person', '["17:00-22:00"]', 6, 12, '["bbq.jpg"]');

-- Sample seasonal pricing (chỉ thêm nếu bảng trống)
INSERT IGNORE INTO seasonal_pricing (type_id, season_name, start_date, end_date, base_price, weekend_multiplier, holiday_multiplier, priority) VALUES
-- Standard Room seasonal pricing
(1, 'Low Season', '2024-05-01', '2024-09-30', 800000, 1.20, 1.50, 1),
(1, 'High Season', '2024-02-01', '2024-04-30', 1200000, 1.25, 1.80, 1),
(1, 'Peak Season', '2024-12-15', '2025-01-31', 1500000, 1.30, 2.00, 1),
(1, 'Mid Season', '2024-10-01', '2024-12-14', 1000000, 1.20, 1.60, 1),

-- Deluxe Room seasonal pricing
(2, 'Low Season', '2024-05-01', '2024-09-30', 1200000, 1.20, 1.50, 1),
(2, 'High Season', '2024-02-01', '2024-04-30', 1800000, 1.25, 1.80, 1),
(2, 'Peak Season', '2024-12-15', '2025-01-31', 2200000, 1.30, 2.00, 1),
(2, 'Mid Season', '2024-10-01', '2024-12-14', 1500000, 1.20, 1.60, 1),

-- Suite Room seasonal pricing
(3, 'Low Season', '2024-05-01', '2024-09-30', 2000000, 1.20, 1.50, 1),
(3, 'High Season', '2024-02-01', '2024-04-30', 3000000, 1.25, 1.80, 1),
(3, 'Peak Season', '2024-12-15', '2025-01-31', 3800000, 1.30, 2.00, 1),
(3, 'Mid Season', '2024-10-01', '2024-12-14', 2500000, 1.20, 1.60, 1);

-- ===============================================
-- PHẦN 8.5: SEARCH LOGS TABLE
-- ===============================================

-- Search Logs Table for tracking search queries
CREATE TABLE IF NOT EXISTS search_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    search_query VARCHAR(255) NOT NULL,
    search_type ENUM('room', 'service', 'general') DEFAULT 'room',
    filters JSON,
    results_count INT DEFAULT 0,
    clicked_result_id INT,
    clicked_result_type ENUM('room', 'service') NULL,
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    INDEX idx_search_query (search_query),
    INDEX idx_search_date (search_date),
    INDEX idx_customer_id (customer_id),
    INDEX idx_search_type (search_type)
);

-- ===============================================
-- HOÀN THÀNH SETUP DATABASE
-- ===============================================

-- ===============================================
-- PHẦN 8: DỮ LIỆU MẪU
-- ===============================================

-- 1. DỮ LIỆU MẪU CHO ROOM_TYPES
INSERT IGNORE INTO room_types (type_name, description, base_price, max_occupancy, amenities, images, status) VALUES
('Standard Room', 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản', 500000, 2, 
'["WiFi miễn phí", "Điều hòa", "TV LCD", "Tủ lạnh mini", "Máy sấy tóc"]',
'["standard1.jpg", "standard2.jpg", "standard3.jpg"]', 'active'),
('Deluxe Room', 'Phòng cao cấp với view đẹp và không gian rộng rãi', 800000, 3,
'["WiFi miễn phí", "Điều hòa", "TV LCD 42 inch", "Tủ lạnh", "Ban công", "Máy pha cà phê", "Két an toàn"]',
'["deluxe1.jpg", "deluxe2.jpg", "deluxe3.jpg"]', 'active'),
('Suite Room', 'Phòng suite sang trọng với phòng khách riêng', 1200000, 4,
'["WiFi miễn phí", "Điều hòa", "TV LCD 55 inch", "Tủ lạnh full size", "Ban công lớn", "Máy pha cà phê", "Két an toàn", "Bồn tắm jacuzzi"]',
'["suite1.jpg", "suite2.jpg", "suite3.jpg"]', 'active'),
('Family Room', 'Phòng gia đình với 2 giường đôi, phù hợp cho gia đình có trẻ em', 1000000, 6,
'["WiFi miễn phí", "Điều hòa", "TV LCD", "Tủ lạnh", "Khu vực sinh hoạt chung", "Nôi em bé (theo yêu cầu)"]',
'["family1.jpg", "family2.jpg", "family3.jpg"]', 'active'),
('VIP Room', 'Phòng VIP cao cấp nhất với dịch vụ butler', 2000000, 2,
'["WiFi miễn phí", "Điều hòa", "TV LCD 65 inch", "Tủ lạnh full size", "Ban công view biển", "Máy pha cà phê cao cấp", "Két an toàn", "Bồn tắm jacuzzi", "Dịch vụ butler 24/7"]',
'["vip1.jpg", "vip2.jpg", "vip3.jpg"]', 'active');

-- 2. DỮ LIỆU MẪU CHO ROOMS
INSERT IGNORE INTO rooms (room_number, type_id, room_name, description, floor_number, room_size, price_per_night, weekend_price, holiday_price, amenities, images, view_type, bed_type, bathroom_type, wifi_available, ac_available, tv_available, fridge_available, balcony_available, smoking_allowed, pet_allowed, status, cleaning_status) VALUES
('101', 1, 'Standard Garden View', 'Phòng tiêu chuẩn view vườn tầng 1', 1, 25.5, 500000, 600000, 700000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 32 inch", "Tủ lạnh mini"]',
'["room101_1.jpg", "room101_2.jpg"]', 'garden', 'double', 'private', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, 'available', 'clean'),
('102', 1, 'Standard Garden View', 'Phòng tiêu chuẩn view vườn tầng 1', 1, 25.5, 500000, 600000, 700000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 32 inch", "Tủ lạnh mini"]',
'["room102_1.jpg", "room102_2.jpg"]', 'garden', 'twin', 'private', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, 'available', 'clean'),
('201', 1, 'Standard City View', 'Phòng tiêu chuẩn view thành phố tầng 2', 2, 25.5, 550000, 650000, 750000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 32 inch", "Tủ lạnh mini"]',
'["room201_1.jpg", "room201_2.jpg"]', 'city', 'double', 'private', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, 'available', 'clean'),
('301', 2, 'Deluxe Sea View', 'Phòng deluxe view biển tuyệt đẹp', 3, 35.0, 800000, 950000, 1100000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 42 inch", "Tủ lạnh", "Ban công", "Máy pha cà phê"]',
'["room301_1.jpg", "room301_2.jpg", "room301_3.jpg"]', 'sea', 'queen', 'private', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'available', 'clean'),
('501', 3, 'Sea View Suite', 'Suite cao cấp view biển với phòng khách riêng', 5, 55.0, 1200000, 1400000, 1600000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 55 inch", "Tủ lạnh full size", "Ban công lớn", "Máy pha cà phê", "Bồn tắm jacuzzi"]',
'["suite501_1.jpg", "suite501_2.jpg", "suite501_3.jpg", "suite501_4.jpg"]', 'sea', 'king', 'private', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'available', 'clean'),
('601', 4, 'Family Garden View', 'Phòng gia đình view vườn với 2 giường đôi', 6, 45.0, 1000000, 1200000, 1400000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 42 inch", "Tủ lạnh", "Khu vực sinh hoạt", "Nôi em bé"]',
'["family601_1.jpg", "family601_2.jpg", "family601_3.jpg"]', 'garden', 'double', 'private', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, 'available', 'clean'),
('701', 5, 'VIP Ocean Suite', 'Phòng VIP cao cấp nhất với view biển tuyệt đẹp', 7, 100.0, 2000000, 2300000, 2600000,
'["WiFi miễn phí", "Điều hòa", "TV LCD 75 inch", "Tủ lạnh full size", "Ban công panorama", "Máy pha cà phê cao cấp", "Bồn tắm jacuzzi", "Dịch vụ butler"]',
'["vip701_1.jpg", "vip701_2.jpg", "vip701_3.jpg", "vip701_4.jpg", "vip701_5.jpg"]', 'sea', 'king', 'private', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'available', 'clean');

-- 3. DỮ LIỆU MẪU CHO ADDITIONAL_SERVICES
INSERT IGNORE INTO additional_services (service_name, service_type, description, price, unit, availability_hours, advance_booking_required, max_quantity, images, status) VALUES
('Massage Thư Giãn', 'spa', 'Dịch vụ massage thư giãn toàn thân với tinh dầu thiên nhiên', 300000, 'per_person', '["09:00-22:00"]', 2, 4, '["massage1.jpg", "massage2.jpg"]', 'active'),
('Tour City', 'tour', 'Tour tham quan thành phố bằng xe buýt hop-on hop-off', 250000, 'per_person', '["08:00-18:00"]', 4, 20, '["tour1.jpg", "tour2.jpg"]', 'active'),
('Đưa Đón Sân Bay', 'transport', 'Dịch vụ đưa đón sân bay bằng xe 7 chỗ', 150000, 'per_room', '["24/7"]', 1, 1, '["airport1.jpg"]', 'active'),
('Buffet Sáng', 'food', 'Buffet sáng với các món Á - Âu phong phú', 200000, 'per_person', '["06:00-10:00"]', 0, 10, '["breakfast1.jpg", "breakfast2.jpg"]', 'active'),
('Giặt Ủi', 'laundry', 'Dịch vụ giặt ủi quần áo giao nhận tận phòng', 50000, 'per_day', '["08:00-20:00"]', 1, 5, '["laundry1.jpg"]', 'active');

-- 4. DỮ LIỆU MẪU CHO CUSTOMERS (regular customers)
INSERT IGNORE INTO customers (full_name, email, phone, password_hash, date_of_birth, gender, address, id_number, email_verified, phone_verified, status, role) VALUES
('Nguyễn Văn An', 'nguyenvanan@email.com', '0901234567', '$2b$10$2efAqevCVeJU4ISw5BDAQe35F6hwoND1jXgUPtHFTBAYYVnFV7N4i', '1990-05-15', 'male', '123 Đường ABC, Quận 1, TP.HCM', '123456789', TRUE, TRUE, 'active', 'customer'),
('Trần Thị Bình', 'tranthibinh@email.com', '0907654321', '$2b$10$2efAqevCVeJU4ISw5BDAQe35F6hwoND1jXgUPtHFTBAYYVnFV7N4i', '1985-08-22', 'female', '456 Đường XYZ, Quận 3, TP.HCM', '987654321', TRUE, FALSE, 'active', 'customer'),
('Lê Minh Cường', 'leminhcuong@email.com', '0912345678', '$2b$10$2efAqevCVeJU4ISw5BDAQe35F6hwoND1jXgUPtHFTBAYYVnFV7N4i', '1992-12-10', 'male', '789 Đường DEF, Quận 7, TP.HCM', '456789123', TRUE, TRUE, 'active', 'customer');

-- 5. DỮ LIỆU MẪU CHO PROMOCODES
INSERT IGNORE INTO promocodes (promo_code, promo_name, description, discount_type, discount_value, min_booking_amount, max_discount_amount, usage_limit, valid_from, valid_to, applicable_room_types, status) VALUES
('WELCOME2025', 'Chào mừng năm mới 2025', 'Giảm 10% cho booking đầu tiên trong năm 2025', 'percentage', 10.00, 500000, 200000, 100, '2025-01-01', '2025-03-31', '[1,2,3]', 'active'),
('FAMILY50', 'Ưu đãi gia đình', 'Giảm 50,000 VND cho phòng gia đình', 'fixed_amount', 50000, 800000, 50000, 50, '2025-01-01', '2025-12-31', '[4]', 'active'),
('WEEKEND20', 'Cuối tuần vui vẻ', 'Giảm 20% cho booking cuối tuần', 'percentage', 20.00, 600000, 300000, 200, '2025-01-01', '2025-12-31', '[1,2,3,4]', 'active');

-- TÀI KHOẢN ĐÃ TẠO:
-- Admin: admin@homestay.com / admin123
-- Manager: manager@homestay.com / manager123  
-- Staff: receptionist1@homestay.com / staff123
-- Staff: receptionist2@homestay.com / staff123
-- Staff: housekeeping1@homestay.com / staff123
-- Customer: nguyenvanan@email.com / staff123
-- Customer: tranthibinh@email.com / staff123
-- Customer: leminhcuong@email.com / staff123

SELECT 'Complete database setup completed successfully!' as status;
