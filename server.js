import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./src/db.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Basic test route with API documentation
app.get("/", (req, res) => {
  res.json({
    message: "Credentials API is running",
    version: "1.0.0",
    endpoints: {
      register: {
        method: "POST",
        path: "/api/auth/register",
        description: "Register a new user",
        body: {
          full_name: "string (required)",
          email: "string (optional if phone provided)",
          phone: "string (optional if email provided)",
          password: "string (required)",
          role_id: "number (optional, defaults to 2 for 'user')"
        }
      },
      login: {
        method: "POST",
        path: "/api/auth/login",
        description: "Login user",
        body: {
          email: "string (optional if phone provided)",
          phone: "string (optional if email provided)",
          password: "string (required)"
        }
      }
    },
    example: {
      register: {
        url: "https://credentials-api-group2-20f368b8528b.herokuapp.com/api/auth/register",
        body: {
          full_name: "John Doe",
          email: "john@example.com",
          password: "securepassword123"
        }
      },
      login: {
        url: "https://credentials-api-group2-20f368b8528b.herokuapp.com/api/auth/login",
        body: {
          email: "john@example.com",
          password: "securepassword123"
        }
      }
    }
  });
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
