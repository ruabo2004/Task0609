const { executeQuery } = require("../config/database");
const bcrypt = require("bcryptjs");

async function resetAdminPassword() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Update admin passwords
    const adminEmails = [
      "admin@gmail.com",
      "admin@homestay.com",
      "iezrealcommm@gmail.com",
    ];

    for (const email of adminEmails) {
      const result = await executeQuery(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, email]
      );
      if (result.affectedRows > 0) {
      }
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  }
}

resetAdminPassword();
