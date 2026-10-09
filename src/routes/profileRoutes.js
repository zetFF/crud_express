const express = require("express");

const router = express.Router();

const db = require("../config/database");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, name, email
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil profile",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.json({
      message: "Profile berhasil diambil",
      user: results[0],
    });
  });
});

module.exports = router;
