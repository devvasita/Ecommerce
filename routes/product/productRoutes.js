const express = require("express");
const router = express.Router();
const adminAuthenticate = require("../../middleware/admin/adminAuthenticate");
const productController = require("../../controllers/product/productController");
const productUpload = require("../../multerconfig/product/productStorageConfig");

// To add category
router.post("/addcategory", adminAuthenticate, productController.AddCategory);

// to get category
router.get("/getcategory", productController.GetCategory);

// to add product
router.post(
  "/addProducts",
  [adminAuthenticate, productUpload.single("product_image")],
  productController.AddProducts
);

// to get all products
router.get("/getProducts", productController.GetAllProducts);

module.exports = router;
