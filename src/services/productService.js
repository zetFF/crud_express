const productRepository = require("../repositories/productRepository");
const fs = require("fs");
const path = require("path");

const getProducts = async ({
  search,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
  sort = "newest",
}) => {
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
  // VALIDASI PRICE
  // =========================

  if (
    minPrice !== undefined &&
    (Number.isNaN(Number(minPrice)) || Number(minPrice) < 0)
  ) {
    const error = new Error("minPrice tidak valid");

    error.status = 400;

    throw error;
  }

  if (
    maxPrice !== undefined &&
    (Number.isNaN(Number(maxPrice)) || Number(maxPrice) < 0)
  ) {
    const error = new Error("maxPrice tidak valid");

    error.status = 400;

    throw error;
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    const error = new Error("minPrice tidak boleh lebih besar dari maxPrice");

    error.status = 400;

    throw error;
  }

  // =========================
  // VALIDASI SORT
  // =========================

  const allowedSorts = [
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "name_asc",
    "name_desc",
  ];

  if (!allowedSorts.includes(sort)) {
    const error = new Error("Sort tidak valid");

    error.status = 400;

    throw error;
  }

  // =========================
  // OFFSET
  // =========================

  const offset = (page - 1) * limit;

  // =========================
  // DATABASE
  // =========================

  const products = await productRepository.getProducts({
    search,
    minPrice,
    maxPrice,
    sort,
    limit,
    offset,
  });

  const total = await productRepository.countProducts({
    search,
    minPrice,
    maxPrice,
  });

  return {
    data: products,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (id) => {
  const product = await productRepository.getProductById(id);

  if (!product) {
    const error = new Error("Product tidak ditemukan");
    error.status = 404;

    throw error;
  }

  return product;
};

const createProduct = async ({ name, description, price, stock, image }) => {
  if (!name) {
    const error = new Error("Nama product wajib diisi");

    error.status = 400;

    throw error;
  }

  if (price === undefined || Number(price) < 0) {
    const error = new Error("Harga tidak valid");

    error.status = 400;

    throw error;
  }

  if (stock === undefined || Number(stock) < 0) {
    const error = new Error("Stock tidak valid");

    error.status = 400;

    throw error;
  }

  return await productRepository.createProduct({
    name,
    description,
    price,
    stock,
    image,
  });
};

const updateProduct = async (id, data, file) => {
  const existingProduct = await productRepository.getProductById(id);

  if (!existingProduct) {
    const error = new Error("Product tidak ditemukan");

    error.status = 404;

    throw error;
  }

  const name = data.name ?? existingProduct.name;

  const description = data.description ?? existingProduct.description;

  const price = data.price ?? existingProduct.price;

  const stock = data.stock ?? existingProduct.stock;

  const image = file ? file.filename : existingProduct.image;

  if (Number(price) < 0) {
    const error = new Error("Harga tidak boleh negatif");

    error.status = 400;

    throw error;
  }

  if (Number(stock) < 0) {
    const error = new Error("Stock tidak boleh negatif");

    error.status = 400;

    throw error;
  }

  await productRepository.updateProduct(id, {
    name,
    description,
    price,
    stock,
    image,
  });

  // Debug
  console.log("=== UPDATE IMAGE DEBUG ===");
  console.log("IMAGE LAMA:", existingProduct.image);
  console.log("IMAGE BARU:", image);
  console.log("FILE BARU:", file?.filename);

  // Hapus gambar lama jika ada gambar baru
  if (file && existingProduct.image && existingProduct.image !== image) {
    const oldImagePath = path.join(
      __dirname,
      "../../uploads/products",
      existingProduct.image,
    );

    console.log("PATH GAMBAR LAMA:", oldImagePath);
    console.log("APAKAH FILE ADA?", fs.existsSync(oldImagePath));

    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  return {
    id: Number(id),
    name,
    description,
    price,
    stock,
    image,
  };
};

const deleteProduct = async (id) => {
  const existingProduct = await productRepository.getProductById(id);

  if (!existingProduct || Number(existingProduct.is_deleted) === 1) {
    const error = new Error("Product tidak ditemukan");
    error.status = 404;
    throw error;
  }

  const result = await productRepository.deleteProduct(id);

  if (result.affectedRows === 0) {
    const error = new Error("Product tidak ditemukan");
    error.status = 404;
    throw error;
  }
};

const restoreProduct = async (id) => {
  const result = await productRepository.restoreProduct(id);

  if (result.affectedRows === 0) {
    const error = new Error(
      "Product tidak ditemukan atau tidak sedang dihapus",
    );

    error.status = 404;
    throw error;
  }

  return {
    id: Number(id),
    message: "Product berhasil dipulihkan",
  };
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
};
