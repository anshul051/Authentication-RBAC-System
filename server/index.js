import express from "express";
import dotenv from "dotenv";
import { healthCheck } from "./src/controller/health.controller.js";
import connectDB from "./src/db/connect.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(express.json());

//Routes
app.use("/api/health", healthCheck);

//Test route
app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

// Start server only after DB connection is established
const startServer = async () => {
  try {
    await connectDB();  // Connect to DB first
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/health`);
    })
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);  // Exit process if server fails to start
  }
};

startServer();