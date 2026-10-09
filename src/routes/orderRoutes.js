const express = require("express");

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderDetail,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

// Semua endpoint order wajib login
router.use(authMiddleware);

// User membuat order
router.post("/", createOrder);

// User melihat order miliknya
router.get("/", getMyOrders);

// User melihat detail order miliknya
router.get("/:id", getOrderDetail);

// Admin mengubah status
router.patch("/:id/status", roleMiddleware(["admin"]), updateOrderStatus);

module.exports = router;
