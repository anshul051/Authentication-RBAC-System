const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/health", (req,res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    message: "Backend running very good",
  });
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});