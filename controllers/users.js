const { User } = require("../models/user");
const { ctrlsWrapper, newError, sendMail } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(newError(409, "Email in use"));
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uuidv4();

  const { body } = req;
  const newUser = await User.create({
    ...body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blanc" href="${BASE_URL}/users/verify/${verificationToken}">Verify your email</a>`,
  };
  await sendMail(verifyEmail);

  res.status(201).json({ user: { email, subscription: newUser.subscription } });
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    next(newError(404, "User not found"));
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.status(200).json({ message: "Verification successful" });
};

const repeatEmailVerification = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    next(newError(400, "Missing required field email"));
  }
  if (user.verify) {
    next(newError(400, "Verification has already been passed"));
  }
  const verifyEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blanc" href="${BASE_URL}/users/verify/${user.verificationToken}">Verify your email</a>`,
  };
  await sendMail(verifyEmail);
  res.status(200).json({ message: "Verification email sent" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    next(newError(401, "Email or password is wrong"));
  }

  if (!user.verify) {
    next(newError(409, "Verify your mail first, please"));
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
  verify: ctrlsWrapper(verify),
  repeatEmailVerification: ctrlsWrapper(repeatEmailVerification),
};
