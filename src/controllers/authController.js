import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

// Register a new user
export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role_id } = req.body;

    // Validate required fields
    if (!full_name || !password) {
      return res.status(400).json({ error: "Full name and password are required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: "Either email or phone is required" });
    }

    // Check if user already exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $2",
      [email || null, phone || null]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "User with this email or phone already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user (default role_id to 2 for 'user' if not provided)
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, full_name, email, phone, role_id, created_at`,
      [full_name, email || null, phone || null, password_hash, role_id || 2]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { user_id: newUser.id, role_id: newUser.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: newUser.role_id,
        created_at: newUser.created_at
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validate required fields
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: "Either email or phone is required" });
    }

    // Find user by email or phone
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $2",
      [email || null, phone || null]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

