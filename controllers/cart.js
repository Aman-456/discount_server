const Cart = require('../models/cart');

// Add item to cart
exports.addItem = async (req, res) => {
    try {
        const { customer, item, quantity, total } = req.body;
        const cart = new Cart({ customer, items: [{ item, quantity }], total });
        await cart.save();
        res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

// Update item in cart
exports.updateItem = async (req, res) => {
    try {
        const { customerId, itemId, quantity } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { customer: customerId, 'items.item': itemId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        );
        if (!cart) {
            return res.status(404).json({ message: 'Cart or item not found' });
        }
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
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
            return res.status(404).json({ message: 'Cart or item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};

// Get cart details
exports.getCart = async (req, res) => {
    try {
        const { customerId } = req.query;
        const cart = await Cart.findOne({ customer: customerId }).populate('items.item', 'name').sort({ $natural: -1 })
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json({ cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};
