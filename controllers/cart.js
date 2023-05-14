const Cart = require('../models/cart');

// Add item to cart
exports.addItem = async (req, res) => {
    try {
        const { customer, itemId, quantity, total } = req.body;
        const find = await Cart.findOne({ customer })
        if (find) {
            await Cart.findOneAndUpdate(
                { customer: customer },
                { $push: { items: { item: itemId, quantity: quantity } } },
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
        const update = req.body.udpate;
        var condition = { $push: { items: { item: itemId, quantity: quantity } } }
        if (!update) {
            condition = { $set: { 'items.$.quantity': quantity } }
        }
        const { customerId, itemId, quantity } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { customer: customerId, 'items.item': itemId },
            condition,
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
        const cart = await Cart.findOne({ customer: customerId }).populate('items.item', 'name').sort({ $natural: -1 })
        if (!cart) {
            return res.status(404).json({ type: 'Cart not found' });
        }
        res.status(200).json({ cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ type: 'An error occurred' });
    }
};
