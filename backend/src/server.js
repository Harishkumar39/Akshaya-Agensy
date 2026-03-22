import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// High-reliability start pattern
const startServer = async () => {
  try {
    // 1. Wait for Database
    await connectDB();
    console.log("Database handshake successful");

    // 2. Then start listening
    app.listen(PORT, () => {
      console.log(`Akshaya Agency Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Critical Startup Error:", error.message);
    process.exit(1); // Stop the process if we can't connect
  }
};

startServer();