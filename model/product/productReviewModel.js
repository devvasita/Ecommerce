const mongoose = require("mongoose");

const productReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: [true, "ProductId is required"],
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const prodcutReviewModel = mongoose.model(
  "productReviews",
  productReviewSchema
);

module.exports = prodcutReviewModel;
