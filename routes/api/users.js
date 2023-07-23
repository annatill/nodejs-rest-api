const express = require("express");
const router = express.Router();
const { validateBody, authenticate } = require("../../middleware");
const {
  userValidateSchema,
  updateSubscriptionSchema,
} = require("../../models/user");
const ctrls = require("../../controllers/users");

router.get("/current", authenticate, ctrls.current);

router.post("/register", validateBody(userValidateSchema), ctrls.register);

router.post("/login", validateBody(userValidateSchema), ctrls.login);

router.post("/logout", authenticate, ctrls.logout);

router.patch(
  "/",
  authenticate,
  validateBody(updateSubscriptionSchema),
  ctrls.updateSubscription
);

module.exports = router;
