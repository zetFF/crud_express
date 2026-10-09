const adminRepository = require("../repositories/adminRepository");

const getOrders = async ({ page = 1, limit = 10, status }) => {
  page = Number(page);
  limit = Number(limit);

  // =========================
  // VALIDASI PAGE
  // =========================

  if (!Number.isInteger(page) || page < 1) {
    const error = new Error("Page harus berupa angka >= 1");

    error.status = 400;

    throw error;
  }

  // =========================
  // VALIDASI LIMIT
  // =========================

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    const error = new Error("Limit harus antara 1 sampai 100");

    error.status = 400;

    throw error;
  }

  // =========================
  // VALIDASI STATUS
  // =========================

  const allowedStatuses = ["pending", "paid", "completed", "cancelled"];

  if (status && !allowedStatuses.includes(status)) {
    const error = new Error("Status tidak valid");

    error.status = 400;

    throw error;
  }

  const offset = (page - 1) * limit;

  const orders = await adminRepository.getOrders({
    status,
    limit,
    offset,
  });

  const total = await adminRepository.countOrders({
    status,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data: orders,

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const getDashboardStats = async () => {
  const stats = await adminRepository.getDashboardStats();

  return {
    totalOrders: Number(stats.totalOrders),

    totalRevenue: Number(stats.totalRevenue),

    pendingOrders: Number(stats.pendingOrders),

    paidOrders: Number(stats.paidOrders),

    completedOrders: Number(stats.completedOrders),

    cancelledOrders: Number(stats.cancelledOrders),
  };
};

module.exports = {
  getOrders,
  getDashboardStats,
};
