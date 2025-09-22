const mysql = require("mysql2/promise");

async function setupDatabase() {
  let connection;

  try {
    // Connect to MySQL without selecting a database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Viettit2004@",
    });

    console.log("✅ Connected to MySQL server");

    // Create database
    await connection.execute("CREATE DATABASE IF NOT EXISTS task0609");
    console.log("✅ Database task0609 created/verified");

    // Use the database
    await connection.execute("USE task0609");

    // Create search_logs table
    const createSearchLogsTable = `
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
        
        INDEX idx_search_query (search_query),
        INDEX idx_search_date (search_date),
        INDEX idx_search_type (search_type)
      )
    `;

    await connection.execute(createSearchLogsTable);
    console.log("✅ search_logs table created/verified");

    // Insert some sample search data
    const sampleSearches = [
      [
        "phòng đôi",
        "room",
        "{}",
        5,
        null,
        null,
        "session123",
        "127.0.0.1",
        "Mozilla/5.0",
      ],
      [
        "homestay gần biển",
        "room",
        '{"location":"near_beach"}',
        3,
        null,
        null,
        "session124",
        "127.0.0.1",
        "Mozilla/5.0",
      ],
      [
        "phòng gia đình",
        "room",
        '{"guests":4}',
        2,
        null,
        null,
        "session125",
        "127.0.0.1",
        "Mozilla/5.0",
      ],
    ];

    for (const search of sampleSearches) {
      try {
        await connection.execute(
          "INSERT IGNORE INTO search_logs (search_query, search_type, filters, results_count, clicked_result_id, clicked_result_type, session_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          search
        );
      } catch (err) {
        // Ignore duplicate errors
      }
    }

    console.log("✅ Sample search data inserted");
    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
