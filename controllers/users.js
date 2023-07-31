const { User } = require("../models/user");
const { ctrlsWrapper, newError } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(newError(409, "Email in use"));
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const { body } = req;
  const newUser = await User.create({
    ...body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({ user: { email, subscription: newUser.subscription } });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    next(newError(401, "Email or password is wrong"));
  }
  const payload = { id: user._id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res
    .status(200)
    .json({ token, user: { email, subscription: user.subscription } });
};

const current = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json({});
};

const updateSubscription = async (req, res) => {
  const { _id: id } = req.user;
  const { subscription } = req.body;
  const result = await User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true, select: "email subscription" }
  );
  if (!result) {
    throw newError(404, "Not found");
  }
  res.status(200).json(result);
};

const updateAvatar = async (req, res) => {
  const { _id: id } = req.user;
  const { path: tepmUpload, originalname } = req.file;

  const img = await Jimp.read(tepmUpload);
  await img.resize(250, 250).writeAsync(tepmUpload);

  const filename = `${id}_${originalname}`;

  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tepmUpload, resultUpload);

  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(id, { avatarURL });
  res.status(200).json({ avatarURL });
};

module.exports = {
  register: ctrlsWrapper(register),
  login: ctrlsWrapper(login),
  current: ctrlsWrapper(current),
  logout: ctrlsWrapper(logout),
  updateSubscription: ctrlsWrapper(updateSubscription),
  updateAvatar: ctrlsWrapper(updateAvatar),
};
