const cartDB = require("../../model/cart/cartModel");
const productsDB = require("../../model/product/productModel");

// To add product to cart
exports.AddToCart = async (req, res) => {
  const { id } = req.params;

  try {
    const productFind = await productsDB.findOne({
      _id: id,
    });

    //   ? First it will check if product is available in quantity
    if (productFind?.quantity >= 1) {
      const cartsItem = await cartDB.findOne({
        userId: req.userId,
        productId: productFind._id,
      });

      // ? Then it will check for cart
      //  ? IF availble than increase  else  add into cart
      if (cartsItem?.quantity >= 1) {
        cartsItem.quantity = cartsItem.quantity + 1;

        await cartsItem.save();

        // decfrement product quantity
        productFind.quantity = productFind.quantity - 1;
        await productFind.save();

        return res.status(200).json({
          message: "Item quantity increased in your cart.",
        });
      } else {
        const addToCart = new cartDB({
          userId: req.userId,
          productId: productFind._id,
          quantity: 1,
        });
        await addToCart.save();

        // decrement product quantity
        productFind.quantity = productFind.quantity - 1;
        await productFind.save();

        return res.status(200).json({
          message: "Item successfully added in your cart.",
        });
      }
    } else {
      return res.status(400).json({
        error: "Sold Out ...",
      });
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

// get all carts value
exports.GetCartItems = async (req, res) => {
  try {
    const allCartItems = await cartDB
      .find({
        userId: req.userId,
      })
      .populate("productId");

    if (!allCartItems || !allCartItems.length) {
      return res.status(400).json({ error: "No items found in cart" });
    }

    res.status(200).json(allCartItems);
  } catch (error) {
    res.json(400).json(error);
  }
};

// to remove single item from cart
exports.RemoveSingleItem = async (req, res) => {
  const { id } = req.params;

  try {
    const productFind = await productsDB.findOne({
      _id: id,
    });

    const cartsItem = await cartDB.findOne({
      userId: req.userId,
      productId: productFind._id,
    });

    if (!cartsItem) {
      return res.status(404).json({
        error: "Cart item not found",
      });
    }
    if (cartsItem?.quantity == 1) {
      const deleteCartItem = await cartDB.findByIdAndDelete({
        _id: cartsItem._id,
      });

      // Increment product quantity
      productFind.quantity = productFind.quantity + 1;
      await productFind.save();

      res.status(200).json({
        message: "Item successfully removed from cart.",
        deleteCartItem,
      });
    } else if (cartsItem?.quantity > 1) {
      // Decrement in cart
      cartsItem.quantity = cartsItem.quantity - 1;
      await cartsItem.save();

      // Increment product quantity
      productFind.quantity = productFind.quantity + 1;
      await productFind.save();

      res.status(200).json({
        message: "Item quantity decreased in your cart..",
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

// To remove all items from cart
exports.RemoveAllItemsFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const productFind = await productsDB.findOne({
      _id: id,
    });

    const cartsItem = await cartDB.findOne({
      userId: req.userId, 
      productId: productFind._id,
    });

    if (!cartsItem) {
      return res.status(400).json({ error: "No items found in cart" });
    }

    const deleteCartItem = await cartDB.findByIdAndDelete({
      _id: cartsItem._id,
    });

    // prodcut increment
    productFind.quantity = productFind.quantity + cartsItem.quantity;
    await productFind.save();

    res.status(200).json({
      message: "Your Iteam sucessfully removed from cart.",
      deleteCartItem,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

// to delete cart data after order done
exports.DeleteCartAfterPayment = async (req, res) => {
  try {
    const deleteCartItem = await cartDB.deleteMany({
      userId: req.userId,
    });

    res.status(200).json(deleteCartItem);
  } catch (error) {
    res.status(400).json(error);
  }
};
