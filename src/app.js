require("dotenv").config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API berjalan!",
  });
});

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Global error handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
