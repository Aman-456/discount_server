const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');

router.post('/add', cartController.addItem);
router.put('/update', cartController.updateItem);
router.delete('/delete', cartController.deleteItem);
router.get('/get', cartController.getCart);

exports.routes = router;
