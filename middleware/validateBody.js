const { newError } = require("../helpers");

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    next(newError(400, errorMessage));
  }
  return next();
};

module.exports = validateBody;
