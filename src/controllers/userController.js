const bcrypt = require("bcrypt");
const db = require("../config/database");
const userService = require("../services/userService");
const { successResponse } = require("../utils/response");

// GET semua user
const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      role: req.query.role,
    });

    return successResponse(res, "Users berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

// GET user berdasarkan ID
const getUserById = (req, res) => {
  const id = Number(req.params.id);

  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data user",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.json(results[0]);
  });
};

// POST user baru
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek email
    const [existingUsers] = await db
      .promise()
      .query("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role default user
    const userRole = role === "admin" ? "admin" : "user";

    const [result] = await db.promise().query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, hashedPassword, userRole],
    );

    return res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: {
        id: result.insertId,
        name,
        email,
        role: userRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT / update user
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const { name, email, password, role } = req.body;

    // Cek user
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role harus user atau admin",
      });
    }

    // Cek email milik user lain
    if (email) {
      const [existingUsers] = await db.promise().query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
        `,
        [email, userId],
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email sudah digunakan user lain",
        });
      }
    }

    const currentUser = users[0];

    const newName = name || currentUser.name;
    const newEmail = email || currentUser.email;
    const newRole = role || currentUser.role;

    let newPassword = currentUser.password;

    if (password) {
      newPassword = await bcrypt.hash(password, 10);
    }

    await db.promise().query(
      `
      UPDATE users
      SET name = ?,
          email = ?,
          password = ?,
          role = ?
      WHERE id = ?
      `,
      [newName, newEmail, newPassword, newRole, userId],
    );

    return res.json({
      success: true,
      message: "User berhasil diperbarui",
      data: {
        id: Number(userId),
        name: newName,
        email: newEmail,
        role: newRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE user
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const [users] = await db
      .promise()
      .query("SELECT id FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    await db.promise().query(
      `
  UPDATE users
  SET is_deleted = TRUE
  WHERE id = ?
  `,
      [userId],
    );

    return res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
