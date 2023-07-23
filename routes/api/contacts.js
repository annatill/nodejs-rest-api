const express = require("express");
const ctrls = require("../../controllers/contacts");
const {
  validateBody,
  haveBody,
  validateFavorite,
  isValidId,
  authenticate,
} = require("../../middleware");

const router = express.Router();

const { addSchema } = require("../../models/contact");

router.get("/", authenticate, ctrls.listContacts);

router.get("/:contactId", authenticate, isValidId, ctrls.getContactById);

router.post(
  "/",
  authenticate,
  haveBody,
  validateBody(addSchema),
  ctrls.addContact
);

router.delete("/:contactId", authenticate, isValidId, ctrls.removeContact);

router.put(
  "/:contactId",
  authenticate,
  haveBody,
  isValidId,
  validateBody(addSchema),
  ctrls.updateContact
);

router.patch(
  "/:contactId/favorite",
  isValidId,
  haveBody,
  validateFavorite,
  ctrls.updateStatusContact
);

module.exports = router;
