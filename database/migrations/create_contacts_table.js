/**
 * Migration: Create contacts table
 * Run this file to create the contacts table for storing contact form submissions
 */

const { executeQuery } = require("../../backend/config/database");

async function runMigration() {
  console.log("🚀 Starting migration: Create contacts table...\n");

  try {
    // Check if table already exists
    console.log("1️⃣ Checking if contacts table exists...");
    const checkTable = await executeQuery("SHOW TABLES LIKE 'contacts'");

    if (checkTable.length > 0) {
      console.log("✅ Contacts table already exists. Skipping migration.\n");
      process.exit(0);
    }

    console.log("📝 Contacts table does not exist. Creating now...\n");

    // Create contacts table
    console.log("2️⃣ Creating contacts table...");
    await executeQuery(`
      CREATE TABLE contacts (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read') DEFAULT 'unread',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_status (status),
        KEY idx_created_at (created_at),
        KEY idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log("✅ Contacts table created successfully!\n");

    // Verify the changes
    console.log("3️⃣ Verifying changes...");
    const verifyTable = await executeQuery("SHOW TABLES LIKE 'contacts'");

    if (verifyTable.length > 0) {
      console.log("✅ Verification successful!");

      // Show table structure
      const tableStructure = await executeQuery("DESCRIBE contacts");
      console.log("\n📊 Table structure:");
      console.table(tableStructure);

      console.log("\n✨ Migration completed successfully! ✨\n");
    } else {
      console.log("❌ Verification failed. Please check manually.\n");
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed with error:");
    console.error(error);
    console.log("\n💡 Possible solutions:");
    console.log("1. Check if MySQL server is running");
    console.log("2. Verify database connection settings in backend/.env");
    console.log("3. Ensure you have proper permissions to CREATE TABLE\n");
    process.exit(1);
  }
}

// Run migration
runMigration();
