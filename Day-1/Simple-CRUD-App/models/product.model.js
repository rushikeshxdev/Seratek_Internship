const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'Product name is required']
    },

    price : {
        type: Number,
        required: [true, 'Product price is required']
    },

    quantity : {
        type: Number,
        required: true,
        default: 0
    },

    image : {
        type: String,
        required: false
    },

    Timestamp : {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;