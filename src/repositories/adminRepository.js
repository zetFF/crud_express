const db = require("../config/database");

const getOrders = ({ status, limit, offset }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_price,
        o.created_at,

        u.name AS customer_name,
        u.email AS customer_email

      FROM orders o

      INNER JOIN users u
        ON u.id = o.user_id
    `;

    const params = [];

    // =========================
    // FILTER STATUS
    // =========================

    if (status) {
      sql += `
        WHERE o.status = ?
      `;

      params.push(status);
    }

    // =========================
    // SORT
    // =========================

    sql += `
      ORDER BY o.id DESC
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

const countOrders = ({ status }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT COUNT(*) AS total
      FROM orders
    `;

    const params = [];

    if (status) {
      sql += `
        WHERE status = ?
      `;

      params.push(status);
    }

    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0].total);
    });
  });
};

const getDashboardStats = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT

        COUNT(*) AS totalOrders,

        COALESCE(
          SUM(
            CASE
              WHEN status IN ('paid', 'completed')
              THEN total_price
              ELSE 0
            END
          ),
          0
        ) AS totalRevenue,

        SUM(
          CASE
            WHEN status = 'pending'
            THEN 1
            ELSE 0
          END
        ) AS pendingOrders,

        SUM(
          CASE
            WHEN status = 'paid'
            THEN 1
            ELSE 0
          END
        ) AS paidOrders,

        SUM(
          CASE
            WHEN status = 'completed'
            THEN 1
            ELSE 0
          END
        ) AS completedOrders,

        SUM(
          CASE
            WHEN status = 'cancelled'
            THEN 1
            ELSE 0
          END
        ) AS cancelledOrders

      FROM orders
    `;

    db.query(sql, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results[0]);
    });
  });
};
module.exports = {
  getOrders,
  countOrders,
  getDashboardStats,
};
