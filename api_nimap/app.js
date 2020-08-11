const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in the mongoose models
const { Category, Product } = require('./db/models');



/* MIDDLEWARE  */

// Load middleware
app.use(bodyParser.json());


// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


/* END MIDDLEWARE  */

/* ROUTE HANDLERS */

/* Category ROUTES */

/**
 * GET /category
 * Purpose: Get all categories
 */
app.get('/category', (req, res) => {
    // We want to return an array of all the product categories 
    Category.find({
       
    }).then((categories) => {
        res.send(categories);
    }).catch((e) => {
        res.send(e);
    });
})

/**
 * POST /category/create
 * Purpose: Create a new category
 */
app.post('/category/create', (req, res) => {
    // We want to create a new category and return the new category document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body
    let name = req.body.name;
    let description = req.body.description;
	
    let newCategory = new Category({
        name,
        description
    });
    newCategory.save().then((categoryDoc) => {
        // the full category document is returned (incl. id)
        res.send(categoryDoc);
    })
});

/**
 * PATCH /category/:id
 * Purpose: Update a specified category
 */
app.patch('/category/:id', (req, res) => {
    // We want to update the specified category (category document with id in the URL) with the new values specified in the JSON body of the request
    Category.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});

/**
 * DELETE /category/:id
 * Purpose: Delete a category
 */
app.delete('/category/:id', (req, res) => {
    // We want to delete the specified category (document with id in the URL)
    Category.findOneAndRemove({
        _id: req.params.id
    }).then((removedCategoryDoc) => {
        res.send(removedCategoryDoc);

        // delete all the products that are in the deleted category
        deleteProductsFromCategory(removedCategoryDoc._id);
    })
});


/**
 * GET /category/:categoryId/products
 * Purpose: Get all products in a specific category
 */
app.get('/category/:categoryId/products', (req, res) => {
    // We want to return all products that belong to a specific category (specified by categoryId)
    Product.find({
        category: req.params.categoryId
    }).populate('category').then((products) => {
        res.send(products);
    })
});


/**
 * GET /products
 * Purpose: Get all products from all categories
 */
app.get('/products', (req, res) => {
    // We want to return all products that belong to all the categories 
    Product.find({
       
    }).populate('category').then((products) => {
        res.send(products);
    })
});

/**
 * GET /products/:id
 * Purpose: Get a product by a productId
 */
app.get('/products/:id', (req, res) => {
    // We want to return a product (specified by productId)
    Product.find({
        _id: req.params.id
    }).populate('category').then((product) => {
        res.send(product);
    })
});

/**
 * POST /category/product/create
 * Purpose: Create a new product in a specific category
 */
app.post('/category/product/create', (req, res) => {
    // We want to create a new product in a category specified by categoryId

    Category.findOne({
        name: req.body.category
    }).then((category) => {
        let newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: category._id
        });
        newProduct.save().then((newProductDoc) => {
            res.send(newProductDoc);
        })
    })
})

/**
 * PATCH /category/:categoryId/products/:productId
 * Purpose: Update an existing product
 */
app.patch('/category/:categoryId/products/:productId', (req, res) => {
    // We want to update an existing product (specified by productId)

    Category.findOne({
        _id: req.params.categoryId,
        
    }).then((category) => {
        if (category) {
            
            return true;
        }

        
        return false;
    }).then((canUpdateProducts) => {
        if (canUpdateProducts) {
            
            Product.findOneAndUpdate({
                _id: req.params.productId,
                category: req.params.categoryId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })
});

/**
 * DELETE /products/:productId
 * Purpose: Delete a product
 */
app.delete('/products/:productId',(req, res) => {

    Product.findOneAndRemove({
        _id: req.params.productId,
        
    }).then((removedProductDoc) => {
        res.send(removedProductDoc);
    })
});



/* HELPER METHODS */
let deleteProductsFromCategory = (_categoryId) => {
    Product.deleteMany({
        category:_categoryId
    }).then(() => {
        console.log("Products from " + _categoryId + " were deleted!");
    })
}




app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})