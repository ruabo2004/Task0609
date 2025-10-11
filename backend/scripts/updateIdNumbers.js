const { executeQuery } = require("../config/database");

async function updateIdNumbers() {
  try {
    // Update users with sample ID numbers
    const updates = [
      { email: "iezreal.com@gmail.com", id_number: "123456789" },
      { email: "admin@test.com", id_number: "987654321" },
      { email: "staff@test.com", id_number: "111222333" },
      { email: "customer@test.com", id_number: "001234567890" },
    ];

    for (const update of updates) {
      const result = await executeQuery(
        "UPDATE users SET id_number = ? WHERE email = ?",
        [update.id_number, update.email]
      );
      console.log(
        `✅ Updated ${update.email} with id_number: ${update.id_number}`
      );
    }

    // Show updated users
    const users = await executeQuery(
      "SELECT id, email, full_name, phone, id_number, role FROM users WHERE id_number IS NOT NULL ORDER BY id"
    );
    console.table(users);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating id_numbers:", error);
    process.exit(1);
  }
}

updateIdNumbers();
