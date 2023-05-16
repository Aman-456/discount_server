const Cart = require('../models/cart');

// Add item to cart
exports.addItem = async (req, res) => {
    try {
        const { customer, itemId, quantity, total, vendor } = req.body;
        const find = await Cart.findOne({ customer })
        if (find) {
            await Cart.findOneAndUpdate(
                { customer: customer },
                { $push: { items: { item: itemId, quantity: quantity, vendor } } },
                { new: true }
            );

            return res.status(200).json({ type: "success", result: 'Item added to cart successfully' });
        }
        const cart = new Cart({ customer, items: [{ item: itemId, quantity, id: itemId }], total });
        await cart.save();

        res.status(200).json({ type: "success", result: 'Item added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ type: "failure", result: 'An error occurred' });
    }
};

// Update item in cart
exports.updateItem = async (req, res) => {
    try {
        const { customer, itemId, quantity } = req.body;
        console.log({ customer, itemId, quantity });
        const cart = await Cart.findOneAndUpdate(
            { customer, 'items.item': itemId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        );
        if (!cart) {
            return res.status(404).json({ type: "failure", result: 'Cart or item not found' });
        }
        res.status(200).json({ type: "success", result: 'Item updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ type: "failure", result: 'An error occurred' });
    }
};

// Delete item from cart
exports.deleteItem = async (req, res) => {
    try {
        const { customerId, itemId } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { customer: customerId },
            { $pull: { items: { item: itemId } } },
            { new: true }
        )
        if (!cart) {
            return res.status(404).json({ type: "success", result: 'Cart or item not found' });
        }
        res.status(200).json({ type: "success", result: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ type: 'failure' });
    }
};

// Get cart details
exports.getCart = async (req, res) => {
    try {
        const { customerId } = req.query;
        const cart = await Cart.findOne({ customer: customerId }).populate('items.item', 'name price image').sort({ $natural: -1 })
        var total = 0;
        for (const item of cart.items) {
            total += item.quantity * item.item.price;
        }
        if (!cart) {
            return res.status(404).json({ type: 'Cart not found' });
        }
        res.status(200).json({ result: { items: cart.items, total }, type: "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ type: 'An error occurred' });
    }
};
