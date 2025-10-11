-- Update id_number for existing users (for testing lookup feature)
-- CMND: 9 digits, CCCD: 12 digits

USE homestay_db;

-- Update test users with sample ID numbers
UPDATE users SET id_number = '123456789' WHERE email = 'iezreal.com@gmail.com';
UPDATE users SET id_number = '987654321' WHERE email = 'admin@test.com';
UPDATE users SET id_number = '111222333' WHERE email = 'staff@test.com';
UPDATE users SET id_number = '001234567890' WHERE email = 'customer@test.com';

-- Show updated users
SELECT id, email, full_name, phone, id_number, role 
FROM users 
WHERE id_number IS NOT NULL
ORDER BY id;

