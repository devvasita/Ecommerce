const mongoose = require("mongoose");

const userContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const usercontactDB = mongoose.model("userContacts", userContactSchema);
module.exports = usercontactDB;
