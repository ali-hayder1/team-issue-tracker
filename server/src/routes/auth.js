const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  updateProfile,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.patch("/me", verifyToken, updateProfile);

module.exports = router;
