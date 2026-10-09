const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validasi name
  if (!name || name.trim() === "") {
    errors.name = "Nama wajib diisi";
  } else if (name.trim().length < 3) {
    errors.name = "Nama minimal 3 karakter";
  }

  // Validasi email
  if (!email || email.trim() === "") {
    errors.email = "Email wajib diisi";
  } else if (!emailRegex.test(email)) {
    errors.email = "Format email tidak valid";
  }

  // Validasi password
  if (!password) {
    errors.password = "Password wajib diisi";
  } else if (password.length < 6) {
    errors.password = "Password minimal 6 karakter";
  }

  // Jika ada error
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validasi gagal",
      errors,
    });
  }

  next();
};

module.exports = validateRegister;
