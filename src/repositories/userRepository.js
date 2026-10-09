const db = require("../config/database");

const getUsers = ({ search = "", role = "", limit = 10, offset = 0 }) => {
  return new Promise((resolve, reject) => {
    let sql = `
  SELECT id, name, email, role
  FROM users
  WHERE is_deleted = FALSE
`;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`
    (name LIKE ? OR email LIKE ?)
  `);

      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    if (role) {
      conditions.push("role = ?");
      params.push(role);
    }

    if (conditions.length > 0) {
      sql += " AND " + conditions.join(" AND ");
    }
    
    sql += " LIMIT ? OFFSET ?";

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

module.exports = {
  getUsers,
};
