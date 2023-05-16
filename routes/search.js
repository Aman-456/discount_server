const express = require("express");
const router = express.Router();
const Item = require("../models/item");

// Search items 
router.get("/", async (req, res) => {
    const searchQuery = req.query.q; // Get the search query from the request query parameters

    const data = await Item.find({ $text: { $search: searchQuery } })
        .populate("vendor")
    if (!data) {
        return res.status(500).json({ error: "An error occurred while searching items." });

    }
    res.json(data);

})
exports.routes = router;
