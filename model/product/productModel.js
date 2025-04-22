const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
  },
  {
    timestamps: true,
  }
);

const productsDB = mongoose.model("products", productSchema);
module.exports = productsDB;
