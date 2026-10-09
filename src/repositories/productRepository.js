const db = require("../config/database");

const getProducts = ({ search, minPrice, maxPrice, sort, limit, offset }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        id,
        name,
        description,
        price,
        stock,
        image,
        created_at
      FROM products
    `;

    // Hanya tampilkan product aktif
    const conditions = ["is_deleted = 0"];
    const params = [];

    // SEARCH
    if (search) {
      conditions.push(`
        (
          name LIKE ?
          OR description LIKE ?
        )
      `);

      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    // MIN PRICE
    if (minPrice !== undefined) {
      conditions.push("price >= ?");
      params.push(minPrice);
    }

    // MAX PRICE
    if (maxPrice !== undefined) {
      conditions.push("price <= ?");
      params.push(maxPrice);
    }

    // WHERE
    sql += `
      WHERE ${conditions.join(" AND ")}
    `;

    // SORT
    const sortMap = {
      newest: "created_at DESC",
      oldest: "created_at ASC",
      price_asc: "price ASC",
      price_desc: "price DESC",
      name_asc: "name ASC",
      name_desc: "name DESC",
    };

    sql += `
      ORDER BY ${sortMap[sort] || "id DESC"}
    `;

    // PAGINATION
    sql += `
      LIMIT ?
      OFFSET ?
    `;

    params.push(limit);
    params.push(offset);

    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });
};

const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id,
        name,
        description,
        price,
        stock,
        image,
        created_at,
        is_deleted
      FROM products
      WHERE id = ?
        AND is_deleted = 0
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0]);
    });
  });
};

const createProduct = ({ name, description, price, stock, image }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO products
      (
        name,
        description,
        price,
        stock,
        image
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [name, description, price, stock, image];

    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        id: result.insertId,
        name,
        description,
        price,
        stock,
        image,
      });
    });
  });
};

const updateProduct = (id, { name, description, price, stock, image }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE products
      SET
        name = ?,
        description = ?,
        price = ?,
        stock = ?,
        image = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [name, description, price, stock, image, id],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      },
    );
  });
};

const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE products
      SET is_deleted = 1
      WHERE id = ?
        AND is_deleted = 0
    `;

    db.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};

const restoreProduct = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE products
      SET is_deleted = 0
      WHERE id = ?
        AND is_deleted = 1
    `;

    db.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};

const countProducts = ({ search, minPrice, maxPrice }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT COUNT(*) AS total
      FROM products
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`
        (
          name LIKE ?
          OR description LIKE ?
        )
      `);

      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    if (minPrice !== undefined) {
      conditions.push(`
        price >= ?
      `);

      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      conditions.push(`
        price <= ?
      `);

      params.push(maxPrice);
    }

    if (conditions.length > 0) {
      sql += `
        WHERE ${conditions.join(" AND ")}
      `;
    }

    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(Number(results[0].total));
    });
  });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  countProducts,
  restoreProduct,
};
