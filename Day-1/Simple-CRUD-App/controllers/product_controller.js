const Product = require('../models/product_model');

// Get all products
const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find();
        res.status(200).json(products);
    }catch(error){
        res.status(500).json({ error: 'An error occurred while fetching products' });
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    }catch(error){
        res.status(500).json({ error: 'An error occurred while fetching the product' });
    }
};

// Update a product by ID
const updateProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if(!updatedProduct){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    }catch(error){
        res.status(500).json({ error: 'An error occurred while updating the product' });
    }
};

// Delete a product by ID   
const deleteProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if(!deletedProduct){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    }catch(error){
        res.status(500).json({ error: 'An error occurred while deleting the product' });
    }
};

// Create a new product
const createProduct = async(req, res) => {
    try{
        const product = await Product.create(req.body);
        res.status(201).json(product);
    }catch(error){
        res.status(500).json({ error: 'An error occurred while creating the product' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProduct
};