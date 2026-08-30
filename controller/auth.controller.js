const User = require("../model/user.model");

const jwt = require("jsonwebtoken");

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
