const express = require("express");
const router = express.Router();

const {
  login,
  requestChangePasswordOTP,
  verifyChangePasswordOTP,
  changePassword,
} = require("../controller/auth.controller");

const {
  verifyChangePasswordToken,
} = require("../middleware/changePassword.middleware");

router.post("/login", login);

router.patch("/changePassword", verifyChangePasswordToken, changePassword);

router.post("/changePassword/request", requestChangePasswordOTP);

router.post("/changePassword/otp", verifyChangePasswordOTP);

module.exports = router;
