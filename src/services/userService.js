const userRepository = require("../repositories/userRepository");

const getUsers = async ({ page = 1, limit = 10, search = "", role = "" }) => {
  page = Number(page);
  limit = Number(limit);

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  if (limit > 100) {
    limit = 100;
  }

  const offset = (page - 1) * limit;

  const users = await userRepository.getUsers({
    search,
    role,
    limit,
    offset,
  });

  return {
    page,
    limit,
    search,
    role,
    data: users,
  };
};

module.exports = {
  getUsers,
};
