const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ============================
// PUBLIC
// ============================

router.get("/", getProducts);
router.get("/:id", getProductById);

// ============================
// ADMIN ONLY
// ============================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("image"),
  createProduct,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("image"),
  updateProduct,
);

router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteProduct);

router.patch(
  "/:id/restore",
  authMiddleware,
  roleMiddleware(["admin"]),
  restoreProduct,
);

module.exports = router;
