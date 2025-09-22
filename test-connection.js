const http = require("http");

function testConnection() {
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/rooms",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log("Testing connection to backend server...");

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const jsonData = JSON.parse(data);
        console.log("✅ API Response received");
        console.log("Success:", jsonData.success);
        console.log("Message:", jsonData.message);
        if (jsonData.data && jsonData.data.rooms) {
          console.log("Number of rooms:", jsonData.data.rooms.length);
        }
      } catch (e) {
        console.log("Raw response:", data);
      }
      process.exit(0);
    });
  });

  req.on("error", (error) => {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  });

  req.end();
}

// Give server some time to start
setTimeout(testConnection, 5000);
