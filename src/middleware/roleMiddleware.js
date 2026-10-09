const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User belum login",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
