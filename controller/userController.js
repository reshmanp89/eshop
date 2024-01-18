const session = require("express-session");
const Cart = require("../models/cart");
const Product = require("../models/product");
const calculateSubtotal = require("../helpers/calculateSubtotal");

exports.showCart = async (req, res) => {
  try {
    req.session.userLoggedIn = true;
    const userId = req.session.userId;
    // console.log(userId);
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );

    res.render("cart", { cart, calculateSubtotal });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
};

exports.addToCart = async (req, res) => {
  try {
    req.session.userLoggedIn = true;
    const { productId, quantity } = req.body;
    const userId = req.session.userId;
    // console.log(userId);

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    // console.log('existingProductIndex:', existingProductIndex);

    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity +=
        parseInt(quantity, 10) || 1;
      //update the quantity of product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { quantity: -(quantity || 1) } },
        { new: true }
      );
      //  console.log(updatedProduct);
    } else {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Add the new product to the cart
      cart.products.push({
        product: productId,
        quantity: parseInt(quantity, 10) || 1,
      });
    }
    //update the quantity of product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { quantity: -(quantity || 1) } },
      { new: true }
    );
    // console.log(updatedProduct);
    await cart.save();

    // res.status(200).json({ message: "Product added to cart successfully" });
    req.flash("success", "Product Added to the Cart succesfully");
    res.redirect(`/user/product/${productId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
//removefromcart
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    //  console.log(productId);
    const userId = req.session.userId;
    //  console.log('userId',userId);
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(400).render("cart", { message: "Cart not found" });
    }
    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .render("cart", { message: "Product not found in the cart" });
    }
    //quantity of the product being removed
    const removedQuantity = cart.products[productIndex].quantity;
    //increment the quantity of product in database
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { quantity: removedQuantity } },
      { new: true }
    );

    cart.products.splice(productIndex, 1);
    await cart.save();
    res.redirect("/user/cart");
  } catch (err) {
    console.log(err);
    res.status(500).send("internal server error");
  }
};

exports.updateQuantity = async (req, res) => {
  const productId = req.params.productId;
  console.log("productId", productId);
  const quantity = req.body.quantity;
  console.log(quantity);
  try {
    const cartItem = await Cart.findOneAndUpdate(
      { "products.product": productId },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );

    console.log(cartItem);

    if (cartItem) {
      res.status(200).json({ message: "Quantity updated successfully" });
    } else {
      res.status(404).json({ error: "Product not found in the cart" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("internal server error");
  }
};
