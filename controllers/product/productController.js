const categoryDB = require("../../model/product/productCategoryModel");
const productsDB = require("../../model/product/productModel");
const cloudinary = require("../../cloudinary/cloudinary");
const { uploadToCloudinary } = require("../../helper");
const prodcutReviewDB = require("../../model/product/productReviewModel");

// to add category for products
exports.AddCategory = async (req, res) => {
  const { categoryName, description } = req.body;

  if (!categoryName || !description) {
    return res.status(400).json({ error: "Fill All Details" }); // return here
  }

  try {
    const existingcategory = await categoryDB.findOne({
      categoryName: categoryName,
    });

    if (existingcategory) {
      return res.status(400).json({ error: "This Category Already Exist" }); // return here too
    } else {
      const addCategory = new categoryDB({
        categoryName,
        description,
      });

      await addCategory.save();

      return res.status(200).json(addCategory);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to get all categories
exports.GetCategory = async (req, res) => {
  try {
    const getAllcategory = await categoryDB.find();
    return res.status(200).json(getAllcategory);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to add new products which done by admin

exports.AddProducts = async (req, res) => {
  const { productName, price, discount, quantity, description, category } =
    req.body;

  if (
    !productName ||
    !price ||
    !discount ||
    !quantity ||
    !description ||
    !category ||
    !req.file
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingProduct = await productsDB.findOne({
      productName: productName,
    });

    if (existingProduct) {
      return res.status(400).json({ error: "This product already exist" });
    }

    const file = req.file.path;
    const upload = await uploadToCloudinary(file);

    const newProduct = new productsDB({
      productName,
      price,
      discount,
      quantity,
      description,
      category,
      productImage: upload.secure_url,
    });

    await newProduct.save();
    return res.status(200).json(newProduct);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to get products by pagination and

exports.GetAllProducts = async (req, res) => {
  console.log(req.query.categoryid);

  const categoryId = req.query.categoryid || "";
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 6;

  const query = {};

  if (categoryId !== "all" && categoryId) {
    query.category = categoryId;
  }

  try {
    const skip = (page - 1) * ITEM_PER_PAGE;

    //   product count
    const count = await productsDB.countDocuments(query);

    const getAllProducts = await productsDB
      .find(query)
      .limit(ITEM_PER_PAGE)
      .skip(skip);

    const pageCount = Math.ceil(count / ITEM_PER_PAGE);

    return res.status(200).json({
      getAllProducts,
      Pagination: {
        pageCount,
        totalProducts: count,
      },
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to get single Product
exports.GetSingleProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productsDB.findOne({
      _id: productId,
    });

    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to deleteProduct
exports.DeleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productsDB.findByIdAndDelete({
      _id: productId,
    });

    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// To add product review
exports.AddProductReview = async (req, res) => {
  const { productId } = req.params;

  const { userName, rating, description } = req.body;

  if (!productId || !userName || !rating || !description) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  try {
    const productReview = new prodcutReviewDB({
      userId: req.userMainId,
      productId,
      userName,
      rating,
      description,
    });

    await productReview.save();
    res.status(200).json(productReview);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to get product review
exports.GetProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const allReviews = await prodcutReviewDB.find({
      productId: productId,
    });

    if (!allReviews || !allReviews.length) {
      return res.status(400).json({
        error: "No reviews found ",
      });
    }

    return res.status(200).json(allReviews);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to delete product review
exports.DeleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const deletedReview = await prodcutReviewDB.findByIdAndDelete({
      _id: reviewId,
    });

    if (!deletedReview) {
      return res.status(400).json({
        error: "No review found",
      });
    }

    return res.status(200).json(deletedReview);
  } catch (error) {
    return res.status(400).json(error);
  }
};
