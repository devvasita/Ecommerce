const express = require("express");
const userAuthenticate = require("../../middleware/user/userAuthenticate");
const cartsControllers = require("../../controllers/cart/cartsController");
const router = express.Router();

// to add product in cart
router.post("/addtocart/:id", userAuthenticate, cartsControllers.AddToCart);

// to get cart data as per particular user
router.post("/getCarts", userAuthenticate, cartsControllers.GetCartItems);

// to remove single item from cart
router.delete(
  "/remmoveSingleItem/:id",
  userAuthenticate,
  cartsControllers.RemoveSingleItem
);

// to remove single item from cart
router.delete(
  "/removeAllItem/:id",
  userAuthenticate,
  cartsControllers.RemoveAllItemsFromCart
);

// delete carts data when order done
router.delete(
  "/removecartdata",
  userAuthenticate,
  cartsControllers.DeleteCartAfterPayment
);

module.exports = router;
