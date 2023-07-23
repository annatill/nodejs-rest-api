const { newError } = require("../helpers");

const haveBody = (req, res, next) => {
  const { name, email, phone, favorite } = req.body;

  if (req.method === "PUT" && !name && !email && !phone && !favorite) {
    next(newError(400, "missing fields"));
  }
  if (req.method === "PATCH" && !name && !email && !phone && !favorite) {
    next(newError(400, "missing field favorite"));
  }
  next();
};

module.exports = haveBody;
