const nodemailer = require("nodemailer");

const { META_PASSWORD, META_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: META_EMAIL,
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendMail = async (data) => {
  const mail = { ...data, from: META_EMAIL };
  await transport.sendMail(mail);
  return true;
};

module.exports = sendMail;
