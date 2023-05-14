const express = require("express");
const BP = require("../models/bannerproducts");
const product = require("../models/item");
const Cart = require("../models/cart");
const Order = require("../models/orders");

const router = express.Router();

router.get("/getmostaddedincart", async (req, res) => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const findone = await BP.findOne({})
        const bannerProduct = await BP.findOne({ 'item1.createdAt': { $gt: oneDayAgo } }).populate('item1');
        const firstProduct = await product.findOne({});

        if (bannerProduct) {
            return res.json({ item: bannerProduct })
        }
        const result = await Cart.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.item', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        if (result.length === 0) {
            if (findone) {
                findone.item1 = firstProduct._id;
                await findone.save()
            }
            else {
                const newbanner = new BP({ item1: firstProduct._id })
                await newbanner.save()
            }
            return res.json({ item: firstProduct });
        }

        const mostAddedProduct = result[0];
        var populatedProduct = await product.findById(mostAddedProduct?._id || firstProduct?._id)
        if (mostAddedProduct?._id) {
            findone.item1 = mostAddedProduct._id
            await findone.save()
        }
        else {
            findone.item1 = firstProduct._id
            await findone.save()
        }
        return res.json({ item: populatedProduct });
    } catch (error) {
        console.error(error);
        return res.json({ item: [] });
    }
});

router.get("/getmostordered", async (req, res) => {
    try {
        const oneDayAgo = new Date();
        const findone = await BP.findOne({})
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const firstProduct = await product.findOne({});
        const bannerProduct = await BP.findOne({ 'item2.createdAt': { $gt: oneDayAgo } }).populate('item2');


        if (bannerProduct) {
            return res.json({ item: bannerProduct })
        }

        const result = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.item', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);


        if (result.length === 0) {
            if (findone) {
                findone.item2 = firstProduct._id;
                await findone.save()
            }
            else {
                const newbanner = new BP({ item2: firstProduct._id })
                await newbanner.save()
            }
            return res.json({ item: firstProduct });
        }

        const mostOrderedProduct = result[0];
        var populatedProduct = await product.findById(mostOrderedProduct?._id || firstProduct?._id)
        if (mostOrderedProduct?._id) {
            findone.item2 = populatedProduct._id
            await findone.save()
        }
        else {
            findone.item2 = firstProduct._id
            await findone.save()
        }

        return res.json({ item: populatedProduct });
    } catch (error) {
        console.error(error);
        return res.json({ item: {} });
    }
}
);

exports.routes = router;
