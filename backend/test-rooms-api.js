const Room = require("./models/Room");

async function testRoomsAPI() {
  try {
    console.log("Testing database connection and Room model...");

    // Test database connection first
    const { testConnection } = require("./config/database");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ Database connection failed");
      return;
    }

    // Test Room.getAllRoomsWithDetails()
    console.log("\n🔍 Testing Room.getAllRoomsWithDetails()...");
    const rooms = await Room.getAllRoomsWithDetails();
    console.log(`✅ Successfully retrieved ${rooms.length} rooms`);

    if (rooms.length > 0) {
      console.log("📋 First room:", JSON.stringify(rooms[0], null, 2));
    }

    // Test Room.getRoomTypes()
    console.log("\n🔍 Testing Room.getRoomTypes()...");
    const roomTypes = await Room.getRoomTypes();
    console.log(`✅ Successfully retrieved ${roomTypes.length} room types`);

    if (roomTypes.length > 0) {
      console.log("📋 First room type:", JSON.stringify(roomTypes[0], null, 2));
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error testing rooms API:", error.message);
    console.error("Stack trace:", error.stack);
  }

  process.exit(0);
}

testRoomsAPI();
