import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./src/db.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("Credentials API is running...");
});

// Routes
app.use("/api/auth", authRoutes);

// Database test
pool.query("SELECT NOW()", (err, result) => {
  if (err) console.error("❌ DB connection error:", err);
  else console.log("✅ DB connected at:", result.rows[0].now);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
