const productService = require("../services/productService");

const { successResponse } = require("../utils/response");

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts({
      search: req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    });

    return successResponse(res, "Products berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    return successResponse(res, "Product berhasil diambil", product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, description, price, stock } = req.body;

    const image = req.file ? req.file.filename : null;

    const product = await productService.createProduct({
      name,
      description,
      price,
      stock,
      image,
    });

    return res.status(201).json({
      message: "Product berhasil dibuat",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.file,
    );

    return successResponse(res, "Product berhasil diperbarui", product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);

    return successResponse(res, "Product berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

const restoreProduct = async (req, res, next) => {
  try {
    const product = await productService.restoreProduct(req.params.id);

    return successResponse(res, "Product berhasil dipulihkan", product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
};
