const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { jwtSecret } = require("../config/auth");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const checkSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkSql, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Terjadi kesalahan database",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          message: "Email sudah digunakan",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;

      db.query(
        insertSql,
        [name, email, hashedPassword, "user"],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              message: "Gagal membuat user",
              error: err.message,
            });
          }

          res.status(201).json({
            message: "Register berhasil",
            data: {
              id: result.insertId,
              name,
              email,
            },
          });
        },
      );
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Terjadi kesalahan database",
      });
    }

    // User tidak ditemukan
    if (results.length === 0) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    const user = results[0];

    // Bandingkan password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email atau password salah",
      });
    }

    // Buat JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      message: "Login berhasil",
      token,
    });
  });
};

module.exports = {
  register,
  login,
};
