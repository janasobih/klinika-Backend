const User = require("../model/user.model");
const Password = require("../model/password.model");

const jwt = require("jsonwebtoken");
const sendOTPEmail = require("../config/email.config");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role, slug: user.slug },
    process.env.SECRET_KEY,
  );
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password))) {
    return res.status(404).json({ error: " invalid email or password " });
  }

  const token = signToken(user);

  res
    .status(200)
    .json({ message: "user loged in sucssefully", data: user, jwt: token });
};

exports.requestChangePasswordOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email is required",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No account found with this email",
    });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // OTP expires after 5 minutes
  await Password.findOneAndDelete({ email: user.email });

  await Password.create({
    email: user.email,
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Send OTP to user's email
  await sendOTPEmail(user.email, otp);

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully to your email",
  });
};

exports.verifyChangePasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      status: "fail",
      message: "Email and OTP are required",
    });
  }

  const user = await User.findOne({ email });
  const passwordOTP = await Password.findOne({ email });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  if (
    !passwordOTP ||
    passwordOTP.otp !== otp ||
    passwordOTP.expiresAt < Date.now()
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid or expired OTP",
    });
  }

  const changePasswordToken = jwt.sign(
    {
      id: user._id,
      purpose: "change-password",
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "10m",
    },
  );

  await Password.findByIdAndDelete(passwordOTP._id);

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
    changePasswordToken,
  });
};

exports.changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      status: "fail",
      message: "New password and confirm password are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: "fail",
      message: "Passwords do not match",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      status: "fail",
      message: "Password must be at least 8 characters",
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
};
