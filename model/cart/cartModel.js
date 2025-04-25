const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: [true, "ProductId is required"],
    },
    quantity: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// model for cart

const cartDB = mongoose.model("carts", cartSchema);
module.exports = cartDB;


