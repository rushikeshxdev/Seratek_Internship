const express = require('express');
const Product = require('../models/product.model.js');
const router = express.Router();
const {getAllProducts, getProductById, updateProduct, deleteProduct, updateProduct, createProduct} = require('../controllers/product_controller.js');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/', createProduct);

module.exports = router;

