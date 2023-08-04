const ctrlsWrapper = require("./ctrlsWrapper");
const handleMongooseError = require("./handleMongooseError");
const newError = require("./newError");
const sendMail = require("./mailSender");

module.exports = {
  ctrlsWrapper,
  handleMongooseError,
  newError,
  sendMail,
};
