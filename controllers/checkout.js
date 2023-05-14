const CheckOut = require("../models/checkout");

// Add item to cart
exports.addItem = async (req, res) => {
  try {
    const { customer, itemId, quantity, total } = req.body;
    const find = await CheckOut.findOne({ customer });
    if (find) {
      await CheckOut.findOneAndUpdate(
        { customer: customer },
        { $push: { items: { item: itemId, quantity: quantity } } },
        { new: true }
      );

      return res
        .status(200)
        .json({ type: "success", result: "Item added to cart for checkout successfully" });
    }
    const checkout = new CheckOut({
      customer,
      items: [{ item: itemId, quantity, id: itemId }],
      total,
    });
    await checkout.save();

    res
      .status(200)
      .json({ type: "success", result: "Item added to cart for checkout successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "failure", result: "An error occurred" });
  }
};

// Update item in cart
exports.updateItem = async (req, res) => {
  try {
    const { customer, itemId, quantity } = req.body;
    console.log({ customer, itemId, quantity });
    const checkout = await CheckOut.findOneAndUpdate(
      { customer, "items.item": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );
    if (!checkout) {
      return res
        .status(404)
        .json({ type: "failure", result: "Cart or item not found" });
    }
    res
      .status(200)
      .json({ type: "success", result: "Item updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "failure", result: "An error occurred" });
  }
};

// Delete item from cart
exports.deleteItem = async (req, res) => {
  try {
    const { customerId, itemId } = req.body;
    const checkout = await CheckOut.findOneAndUpdate(
      { customer: customerId },
      { $pull: { items: { item: itemId } } },
      { new: true }
    );
    if (!checkout) {
      return res
        .status(404)
        .json({ type: "success", result: "Cart or item not found" });
    }
    res
      .status(200)
      .json({ type: "success", result: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "failure" });
  }
};

// Get cart details
exports.getCheckout = async (req, res) => {
  try {
    const { customerId } = req.query;
    const checkout = await CheckOut.findOne({ customer: customerId })
      .populate("items.item", "name price image")
      .sort({ $natural: -1 });
    var total = 0;
    for (const item of checkout.items) {
      total += item.quantity * item.item.price;
    }
    if (!checkout) {
      return res.status(404).json({ type: "Cart not found" });
    }
    res
      .status(200)
      .json({ result: { items: checkout.items, total }, type: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "An error occurred" });
  }
};
