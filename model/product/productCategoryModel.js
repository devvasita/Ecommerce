const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    categoryName: {
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

const categoryDB = mongoose.model("category", productCategorySchema);
module.exports = categoryDB;
