const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/product.model.js');
const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies

app.get('/', (req, res) => {
    res.send('Hello, Node API Server Running!');
});

app.get('/api/products', async (req, res) => {
    try{
        const products = await Product.find();
        res.status(200).json(products);
    }catch(error){
        res.status(500).json({ error: 'An error occurred while fetching products' });
    }
});

app.get('/api/product/:id', async (req, res) => {
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
});

app.put('/api/product/:id', async (req, res) => {
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
});

app.delete('/api/product/:id', async (req, res) => {
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
});

app.post('/api/products', async(req, res) => {
    try{
        const product = await Product.create(req.body);
        res.status(201).json(product);
    }catch(error){
        res.status(500).json({ error: 'An error occurred while creating the product' });
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
}); 

mongoose.connect('mongodb+srv://rushirandive09_db_user:pDGP8lgWn7ajGbah@cluster0.lvpte9p.mongodb.net/?appName=Cluster0')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});