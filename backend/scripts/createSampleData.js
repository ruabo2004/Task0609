// Script to create sample data for Dashboard testing
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "homestay_management",
  port: process.env.DB_PORT || 3306,
};

async function createSampleData() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    // Get staff user ID (assuming user ID 11 is staff@test.com)
    const staffUserId = 11;

    // 1. Create sample tasks
    const taskQueries = [
      `INSERT IGNORE INTO staff_tasks (title, description, assigned_to, priority, status, due_date, created_at) 
       VALUES ('Clean Room 101', 'Deep cleaning of room 101 after checkout', ${staffUserId}, 'high', 'pending', '2025-10-07', NOW())`,

      `INSERT IGNORE INTO staff_tasks (title, description, assigned_to, priority, status, due_date, created_at) 
       VALUES ('Inventory Check', 'Check and update room amenities inventory', ${staffUserId}, 'medium', 'in_progress', '2025-10-08', NOW())`,

      `INSERT IGNORE INTO staff_tasks (title, description, assigned_to, priority, status, due_date, created_at) 
       VALUES ('Guest Welcome', 'Prepare welcome package for VIP guest', ${staffUserId}, 'high', 'pending', '2025-10-06', NOW())`,
    ];

    for (const query of taskQueries) {
      await connection.execute(query);
    }
    // 2. Create sample work shifts
    const shiftQueries = [
      `INSERT IGNORE INTO work_shifts (staff_id, shift_date, start_time, end_time, shift_type, status, created_at) 
       VALUES (${staffUserId}, '2025-10-06', '08:00:00', '16:00:00', 'morning', 'scheduled', NOW())`,

      `INSERT IGNORE INTO work_shifts (staff_id, shift_date, start_time, end_time, shift_type, status, created_at) 
       VALUES (${staffUserId}, '2025-10-07', '14:00:00', '22:00:00', 'evening', 'scheduled', NOW())`,

      `INSERT IGNORE INTO work_shifts (staff_id, shift_date, start_time, end_time, shift_type, status, created_at) 
       VALUES (${staffUserId}, '2025-10-08', '08:00:00', '16:00:00', 'morning', 'scheduled', NOW())`,
    ];

    for (const query of shiftQueries) {
      await connection.execute(query);
    }
    // 3. Create sample bookings (for recent bookings section)
    const bookingQueries = [
      `INSERT IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, total_amount, status, created_at) 
       VALUES (1, 1, '2025-10-05', '2025-10-07', 150.00, 'confirmed', NOW())`,

      `INSERT IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, total_amount, status, created_at) 
       VALUES (2, 2, '2025-10-06', '2025-10-08', 200.00, 'confirmed', NOW())`,

      `INSERT IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, total_amount, status, created_at) 
       VALUES (3, 3, '2025-10-07', '2025-10-09', 180.00, 'pending', NOW())`,
    ];

    for (const query of bookingQueries) {
      await connection.execute(query);
    }
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createSampleData();
