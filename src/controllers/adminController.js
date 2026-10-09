const adminService = require("../services/adminService");

const { successResponse } = require("../utils/response");

const getOrders = async (req, res, next) => {
  try {
    const result = await adminService.getOrders({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });

    return successResponse(res, "Data orders berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    return successResponse(res, "Dashboard berhasil diambil", stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getDashboardStats,
};
