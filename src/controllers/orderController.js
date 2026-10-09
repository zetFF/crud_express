const orderService = require("../services/orderService");
const { successResponse } = require("../utils/response");

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    const order = await orderService.createOrder(userId, items);

    return successResponse(res, "Order berhasil dibuat", order, 201);
  } catch (error) {
    next(error);
  }
};

// getMyOrders controller
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getMyOrders(userId);

    return successResponse(res, "Orders berhasil diambil", orders);
  } catch (error) {
    next(error);
  }
};

// getOrderDetail controller
const getOrderDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await orderService.getOrderDetail(req.params.id, userId);

    return successResponse(res, "Order berhasil diambil", order);
  } catch (error) {
    next(error);
  }
};

// updateOrderStatus controller
const updateOrderStatus = async (req, res, next) => {
  try {
    const status = req.body?.status;

    if (!status) {
      const error = new Error("Status wajib dikirim melalui body JSON");
      error.status = 400;
      throw error;
    }

    let result;

    if (status === "cancelled") {
      result = await orderService.cancelOrder(req.params.id);
    } else {
      result = await orderService.updateOrderStatus(req.params.id, status);
    }

    return successResponse(res, "Status order berhasil diperbarui", result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  updateOrderStatus,
};
