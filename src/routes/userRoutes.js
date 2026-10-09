const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const validateUser = require("../middleware/validateUser");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Semua route users wajib login
router.use(authMiddleware);

// Hanya admin
router.get("/", roleMiddleware(["admin"]), getUsers);

router.get("/:id", roleMiddleware(["admin"]), getUserById);

router.post("/", roleMiddleware(["admin"]), validateUser, createUser);

router.put("/:id", roleMiddleware(["admin"]), validateUser, updateUser);

router.delete("/:id", roleMiddleware(["admin"]), deleteUser);

module.exports = router;
