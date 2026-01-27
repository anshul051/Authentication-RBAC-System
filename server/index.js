import express from "express";
import dotenv from "dotenv";
import { healthCheck } from "./src/controller/health.controller.js";

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

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
