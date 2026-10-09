const db = require("../config/database");

// Ambil product berdasarkan ID
const getProductById = (productId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        name,
        price,
        stock
      FROM products
      WHERE id = ?
    `;

    db.query(sql, [productId], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0]);
    });
  });
};

// Ambil semua order berdasarkan user ID
const getOrdersByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_price,
        o.created_at,
        o.updated_at,

        u.name AS customer_name,
        u.email AS customer_email

      FROM orders o

      INNER JOIN users u
        ON u.id = o.user_id

      WHERE o.user_id = ?

      ORDER BY o.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });
};

// Ambil detail order berdasarkan order ID dan user ID
const getOrderDetail = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT

        o.id AS order_id,
        o.user_id,
        o.status,
        o.total_price,
        o.created_at,

        u.name AS customer_name,
        u.email AS customer_email,

        oi.id AS item_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        oi.subtotal,

        p.name AS product_name

      FROM orders o

      INNER JOIN users u
        ON u.id = o.user_id

      INNER JOIN order_items oi
        ON oi.order_id = o.id

      INNER JOIN products p
        ON p.id = oi.product_id

      WHERE o.id = ?
      AND o.user_id = ?

      ORDER BY oi.id ASC
    `;

    db.query(sql, [orderId, userId], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });
};

// Ambil product untuk update (lock row)
const getProductForUpdate = (connection, productId) => {
  return connection.execute(
    `
    SELECT
      id,
      name,
      price,
      stock
    FROM products
    WHERE id = ?
      AND is_deleted = 0
    FOR UPDATE
    `,
    [productId]
  );
};

// Buat order
const createOrder = (connection, userId, totalPrice) => {
  return connection.execute(
    `
    INSERT INTO orders
    (user_id, status, total_price)
    VALUES (?, 'pending', ?)
    `,
    [userId, totalPrice],
  );
};

// Buat order item
const createOrderItem = (
  connection,
  { orderId, productId, quantity, price, subtotal },
) => {
  return connection.execute(
    `
    INSERT INTO order_items
    (
      order_id,
      product_id,
      quantity,
      price,
      subtotal
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [orderId, productId, quantity, price, subtotal],
  );
};

// Kurangi stock
const decreaseStock = (connection, productId, quantity) => {
  return connection.execute(
    `
    UPDATE products
    SET stock = stock - ?
    WHERE id = ?
    AND stock >= ?
    `,
    [quantity, productId, quantity],
  );
};

// Ambil order berdasarkan ID
const getOrderById = (orderId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        user_id,
        status,
        total_price,
        created_at,
        updated_at
      FROM orders
      WHERE id = ?
    `;

    db.query(sql, [orderId], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0]);
    });
  });
};

// Update status order

const updateOrderStatus = (orderId, status) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `;

    db.query(sql, [status, orderId], (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};

const getOrderItems = (connection, orderId) => {
  return connection.execute(
    `
    SELECT
      product_id,
      quantity
    FROM order_items
    WHERE order_id = ?
    `,
    [orderId],
  );
};

const increaseStock = (connection, productId, quantity) => {
  return connection.execute(
    `
    UPDATE products
    SET stock = stock + ?
    WHERE id = ?
    `,
    [quantity, productId],
  );
};

module.exports = {
  getProductById,
  getProductForUpdate,
  createOrder,
  createOrderItem,
  decreaseStock,
  getOrdersByUserId,
  getOrderDetail,
  getOrderById,
  updateOrderStatus,
  getOrderItems,
  increaseStock,
};
