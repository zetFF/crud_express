const db = require("../config/database");
const orderRepository = require("../repositories/orderRepository");

const createOrder = async (userId, items) => {
  // 1. Validasi request
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Items order tidak boleh kosong");
    error.status = 400;
    throw error;
  }

  // Pastikan setiap item memiliki productId dan quantity yang valid
  for (const item of items) {
    if (
      !item ||
      !Number.isInteger(Number(item.productId)) ||
      Number(item.productId) <= 0
    ) {
      const error = new Error("Product ID tidak valid");
      error.status = 400;
      throw error;
    }

    if (
      item.quantity === undefined ||
      item.quantity === null ||
      item.quantity === "" ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      const error = new Error("Quantity harus berupa bilangan bulat positif");
      error.status = 400;
      throw error;
    }
  }

  // Cegah product yang sama dikirim berulang kali
  const productIds = items.map((item) => Number(item.productId));

  if (new Set(productIds).size !== productIds.length) {
    const error = new Error(
      "Product yang sama tidak boleh muncul lebih dari sekali",
    );
    error.status = 400;
    throw error;
  }

  // 2. Ambil koneksi khusus untuk transaksi
  const connection = await db.promise().getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    let totalPrice = 0;
    const orderItems = [];

    // 3. Periksa product, harga, dan stok
    // Urutkan ID untuk mengurangi risiko deadlock antartransaksi
    const sortedItems = [...items].sort(
      (a, b) => Number(a.productId) - Number(b.productId),
    );

    for (const item of sortedItems) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      const [productRows] = await orderRepository.getProductForUpdate(
        connection,
        productId,
      );

      const product = productRows[0];

      if (!product) {
        const error = new Error(
          `Product ${productId} tidak ditemukan atau tidak aktif`,
        );
        error.status = 404;
        throw error;
      }

      if (Number(product.stock) < quantity) {
        const error = new Error(`Stock ${product.name} tidak mencukupi`);
        error.status = 400;
        throw error;
      }

      const price = Number(product.price);
      const subtotal = price * quantity;

      totalPrice += subtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        price,
        subtotal,
      });
    }

    // 4. Buat order utama
    const [orderResult] = await orderRepository.createOrder(
      connection,
      userId,
      totalPrice,
    );

    const orderId = orderResult.insertId;

    // 5. Simpan detail dan kurangi stok
    for (const item of orderItems) {
      await orderRepository.createOrderItem(connection, {
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      });

      const [stockResult] = await orderRepository.decreaseStock(
        connection,
        item.productId,
        item.quantity,
      );

      if (stockResult.affectedRows !== 1) {
        const error = new Error(
          `Gagal mengurangi stok product ${item.productId}`,
        );
        error.status = 409;
        throw error;
      }
    }

    // 6. Simpan seluruh perubahan
    await connection.commit();
    transactionStarted = false;

    return {
      orderId,
      userId,
      status: "pending",
      totalPrice,
      items: orderItems,
    };
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    throw error;
  } finally {
    connection.release();
  }
};

// //////////////////////////////////////////////
// Ambil semua order milik user
const getMyOrders = async (userId) => {
  return await orderRepository.getOrdersByUserId(userId);
};

const getOrderDetail = async (orderId, userId) => {
  const rows = await orderRepository.getOrderDetail(orderId, userId);

  if (rows.length === 0) {
    const error = new Error("Order tidak ditemukan");

    error.status = 404;

    throw error;
  }

  const firstRow = rows[0];

  return {
    id: firstRow.order_id,

    user: {
      id: firstRow.user_id,
      name: firstRow.customer_name,
      email: firstRow.customer_email,
    },

    status: firstRow.status,

    totalPrice: firstRow.total_price,

    createdAt: firstRow.created_at,

    items: rows.map((row) => ({
      id: row.item_id,
      productId: row.product_id,
      productName: row.product_name,
      quantity: row.quantity,
      price: row.price,
      subtotal: row.subtotal,
    })),
  };
};

// update order status
const updateOrderStatus = async (orderId, newStatus) => {
  const allowedStatuses = ["paid", "cancelled", "completed"];

  if (!allowedStatuses.includes(newStatus)) {
    const error = new Error("Status order tidak valid");
    error.status = 400;
    throw error;
  }

  const order = await orderRepository.getOrderById(orderId);

  if (!order) {
    const error = new Error("Order tidak ditemukan");
    error.status = 404;
    throw error;
  }

  const currentStatus = order.status;

  const validTransitions = {
    pending: ["paid", "cancelled"],
    paid: ["completed"],
    completed: [],
    cancelled: [],
  };

  const allowedNextStatuses = validTransitions[currentStatus];

  if (!allowedNextStatuses.includes(newStatus)) {
    const error = new Error(
      `Tidak bisa mengubah status dari ${currentStatus} menjadi ${newStatus}`,
    );
    error.status = 400;
    throw error;
  }

  await orderRepository.updateOrderStatus(orderId, newStatus);

  return {
    id: orderId,
    previousStatus: currentStatus,
    status: newStatus,
  };
};

const cancelOrder = async (orderId) => {
  const connection = await db.promise().getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    // 1. Ambil dan kunci order
    const [orderRows] = await connection.execute(
      `
      SELECT id, status
      FROM orders
      WHERE id = ?
      FOR UPDATE
      `,
      [orderId],
    );

    const order = orderRows[0];

    if (!order) {
      const error = new Error("Order tidak ditemukan");
      error.status = 404;
      throw error;
    }

    // 2. Hanya order pending yang boleh dibatalkan
    if (order.status !== "pending") {
      const error = new Error(
        `Order dengan status ${order.status} tidak bisa dibatalkan`,
      );
      error.status = 400;
      throw error;
    }

    // 3. Ambil semua item dalam order
    const [items] = await orderRepository.getOrderItems(connection, orderId);

    // 4. Kembalikan stok
    for (const item of items) {
      await orderRepository.increaseStock(
        connection,
        item.product_id,
        item.quantity,
      );
    }

    // 5. Ubah status order
    await connection.execute(
      `
      UPDATE orders
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [orderId],
    );

    // 6. Simpan seluruh perubahan
    await connection.commit();
    transactionStarted = false;

    return {
      id: Number(orderId),
      status: "cancelled",
    };
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
};
