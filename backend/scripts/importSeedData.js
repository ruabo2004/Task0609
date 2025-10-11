const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function importSeedData() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "homestay_db",
      multipleStatements: true,
    });
    // Read seed file
    const seedPath = path.join(__dirname, "../../database/seed.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf8");
    // Execute SQL
    await connection.query(seedSQL);
    // Verify data
    const [rooms] = await connection.query(
      "SELECT COUNT(*) as count FROM rooms"
    );
    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const [services] = await connection.query(
      "SELECT COUNT(*) as count FROM services"
    );
    const [bookings] = await connection.query(
      "SELECT COUNT(*) as count FROM bookings"
    );
  } catch (error) {
    console.error("❌ Error importing seed data:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importSeedData();

