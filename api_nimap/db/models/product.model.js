const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
	description: {
		type: String,
        required: true,
        minlength: 1,
        trim: true
	},
	price: {
		type: String,
        required: true,
        minlength: 1,
        trim: true
	},
    category: {
        type: mongoose.Types.ObjectId,
		ref: 'Category',
        required: true
    }
    
})

const Product = mongoose.model('Product', ProductSchema);

module.exports = { Product }