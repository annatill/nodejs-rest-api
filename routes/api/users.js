const express = require("express");
const router = express.Router();
const { validateBody, authenticate, upload } = require("../../middleware");
const {
  userValidateSchema,
  updateSubscriptionSchema,
  mailSchema,
} = require("../../models/user");
const ctrls = require("../../controllers/users");

router.get("/current", authenticate, ctrls.current);

router.get("/verify/:verificationToken", ctrls.verify);

router.post("/verify", validateBody(mailSchema), ctrls.repeatEmailVerification);

router.post("/register", validateBody(userValidateSchema), ctrls.register);

router.post("/login", validateBody(userValidateSchema), ctrls.login);

router.post("/logout", authenticate, ctrls.logout);

router.patch(
  "/",
  authenticate,
  validateBody(updateSubscriptionSchema),
  ctrls.updateSubscription
);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrls.updateAvatar
);

module.exports = router;
