const express = require("express");
const router = express.Router();

const {
  getOrders,
  getDashboardStats,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.get("/dashboard", getDashboardStats);
router.get("/orders", getOrders);

module.exports = router;
