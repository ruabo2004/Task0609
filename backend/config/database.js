const mysql = require("mysql2/promise");
require("dotenv").config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Viettit2004@",
  database: process.env.DB_NAME || "homestay_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

// Execute query helper function
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Get connection for transactions
const getConnection = async () => {
  return await pool.getConnection();
};

// Close all connections
const closePool = async () => {
  try {
    await pool.end();
  } catch (error) {
    console.error("Error closing database pool:", error);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getConnection,
  closePool,
};
