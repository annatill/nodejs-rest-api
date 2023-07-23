const { Contact } = require("../models/contact");
const { ctrlsWrapper, newError } = require("../helpers");

const listContacts = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;

  const skip = (page - 1) * limit;

  const result = await Contact.find(
    { owner, favorite: favorite ?? [true, false] },
    null,
    { skip, limit }
  ).populate("owner", "_id email subscription");
  return res.status(200).json(result);
};

const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);
  if (!result) {
    next(newError(404, "Not found"));
  }
  return res.status(200).json(result);
};

const removeContact = async (req, res, next) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndRemove(contactId);
  if (!result) {
    next(newError(404, "Not found"));
  }
  return res.status(200).json({ message: "Contact deleted" });
};

const addContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { body } = req;
  const result = await Contact.create({ ...body, owner });
  return res.status(201).json(result);
};

const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  const result = await Contact.findByIdAndUpdate(contactId, body);
  if (!result) {
    next(newError(404, "Not found"));
  }
  return res.status(200).json(result);
};

const updateStatusContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  const result = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  if (!result) {
    next(newError(404, "Not found"));
  }
  return res.status(200).json(result);
};

module.exports = {
  listContacts: ctrlsWrapper(listContacts),
  getContactById: ctrlsWrapper(getContactById),
  removeContact: ctrlsWrapper(removeContact),
  addContact: ctrlsWrapper(addContact),
  updateContact: ctrlsWrapper(updateContact),
  updateStatusContact: ctrlsWrapper(updateStatusContact),
};
