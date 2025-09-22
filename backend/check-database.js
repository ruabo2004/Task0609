const { pool } = require("./config/database");

async function checkDatabase() {
  try {
    console.log("Checking raw database data...");

    const [rows] = await pool.execute(
      "SELECT room_id, room_number, images, amenities FROM rooms LIMIT 1"
    );

    if (rows.length > 0) {
      const room = rows[0];
      console.log("Raw room data:");
      console.log("images type:", typeof room.images);
      console.log("images value:", room.images);
      console.log("amenities type:", typeof room.amenities);
      console.log("amenities value:", room.amenities);
    }

    const [roomTypeRows] = await pool.execute(
      "SELECT type_id, type_name, amenities FROM room_types LIMIT 1"
    );

    if (roomTypeRows.length > 0) {
      const roomType = roomTypeRows[0];
      console.log("\nRaw room type data:");
      console.log("amenities type:", typeof roomType.amenities);
      console.log("amenities value:", roomType.amenities);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

checkDatabase();
