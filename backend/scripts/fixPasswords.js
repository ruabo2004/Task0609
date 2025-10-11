// Script to fix user passwords in database
// This will update all user passwords to their correct bcrypt hashes

// Load environment variables
require("dotenv").config();

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "homestay_db",
  port: process.env.DB_PORT || 3306,
};
// Define correct passwords for users
const userPasswords = {
  // Admin accounts
  "admin@homestay.com": "password123",
  "admin@gmail.com": "password123",

  // Staff accounts
  "staff1@homestay.com": "password123",
  "staff2@homestay.com": "password123",
  "nhanvien@gmail.com": "password123",
  "staff@homestay.com": "password123",
  "hoa.staff@homestay.com": "password123",

  // Customer accounts
  "customer1@gmail.com": "password123",
  "customer2@gmail.com": "password123",
  "customer3@gmail.com": "password123",
  "customer4@gmail.com": "password123",
  "customer5@gmail.com": "password123",
  "customer6@gmail.com": "password123",
  "customer7@gmail.com": "password123",
  "customer8@gmail.com": "password123",
  "customer9@gmail.com": "password123",
  "customer10@gmail.com": "password123",
  "iezrealcom@gmail.com": "password123",
  "minhanh@gmail.com": "password123",
  "hungtran@gmail.com": "password123",
  "hoale@gmail.com": "password123",
  "nampham@gmail.com": "password123",
  "lanvo@gmail.com": "password123",
  "tamdo@gmail.com": "password123",
  "thubui@gmail.com": "password123",
  "john.smith@gmail.com": "password123",
  "emily.johnson@gmail.com": "password123",
  "yuki.tanaka@gmail.com": "password123",
};

async function fixPasswords() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    // Get all users from database
    const [users] = await connection.execute(
      "SELECT id, email, full_name, role FROM users"
    );
    let updatedCount = 0;
    let notFoundCount = 0;

    // Update each user's password
    for (const user of users) {
      const plainPassword = userPasswords[user.email];

      if (plainPassword) {
        // Hash the password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // Update in database
        await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          user.id,
        ]);

        console.log(
          `✅ Updated: ${user.email.padEnd(35)} | ${user.full_name.padEnd(
            25
          )} | ${user.role.padEnd(10)} | Password: ${plainPassword}`
        );
        updatedCount++;
      } else {
        console.log(
          `⚠️  Not found: ${user.email.padEnd(35)} | ${user.full_name.padEnd(
            25
          )} | ${user.role.padEnd(10)} | (No password defined)`
        );
        notFoundCount++;
      }
    }
    // Test a login with bcrypt
    const [testUser] = await connection.execute(
      "SELECT email, password FROM users WHERE email = ? LIMIT 1",
      ["admin@homestay.com"]
    );

    if (testUser.length > 0) {
      const isValid = await bcrypt.compare("password123", testUser[0].password);
      if (isValid) {
      } else {
      }
    }
  } catch (error) {
    console.error("\n❌ Error fixing passwords:", error.message);
    console.error("\nFull error:", error);

    if (error.code === "ECONNREFUSED") {
      console.error("\n⚠️  Database connection refused. Please check:");
      console.error("   1. MySQL server is running");
      console.error("   2. Database credentials are correct");
      console.error("   3. Database 'homestay_db' exists");
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
fixPasswords();
