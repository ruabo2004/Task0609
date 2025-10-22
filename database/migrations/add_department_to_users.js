/**
 * Migration: Add department column to users table
 * Run this file to add the department field for staff management
 */

const { executeQuery } = require("../../backend/config/database");

async function runMigration() {
  console.log(
    "🚀 Starting migration: Add department column to users table...\n"
  );

  try {
    // Check if column already exists
    console.log("1️⃣ Checking if department column exists...");
    const checkColumn = await executeQuery(
      "SHOW COLUMNS FROM users LIKE 'department'"
    );

    if (checkColumn.length > 0) {
      console.log("✅ Department column already exists. Skipping migration.\n");
      process.exit(0);
    }

    console.log("📝 Department column does not exist. Adding now...\n");

    // Add department column
    console.log("2️⃣ Adding department column...");
    await executeQuery(
      "ALTER TABLE users ADD COLUMN department VARCHAR(100) DEFAULT NULL AFTER role"
    );
    console.log("✅ Department column added successfully!\n");

    // Add index for better query performance
    console.log("3️⃣ Creating index on department column...");
    await executeQuery("CREATE INDEX idx_department ON users(department)");
    console.log("✅ Index created successfully!\n");

    // Verify the changes
    console.log("4️⃣ Verifying changes...");
    const verifyColumn = await executeQuery(
      "SHOW COLUMNS FROM users LIKE 'department'"
    );

    if (verifyColumn.length > 0) {
      console.log("✅ Verification successful!");
      console.log("📊 Column details:", verifyColumn[0]);
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
    console.log("3. Ensure you have proper permissions to ALTER TABLE\n");
    process.exit(1);
  }
}

// Run migration
runMigration();
