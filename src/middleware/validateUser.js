const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errors = {};

  // Validasi name
  if (!name || name.trim() === "") {
    errors.name = "Nama wajib diisi";
  } else if (name.trim().length < 3) {
    errors.name = "Nama minimal 3 karakter";
  }

  if (!email || email.trim() === "") {
    errors.email = "Email wajib diisi";
  } else if (!emailRegex.test(email)) {
    errors.email = "Format email tidak valid";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validasi gagal",
      errors,
    });
  }

  next();
};

module.exports = validateUser;
