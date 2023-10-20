const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrhwfvt.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productCollection = client.db("productDB").collection('product');
        const brandsCollection = client.db("productDB").collection('brands');
        const cartsCollection = client.db("productDB").collection('cart');
        // const haiku = database.collection("haiku");

        // this is for getting all the brand information which is used in the home component
        app.get("/brands", async (req, res) => {
            const cursor = brandsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // // this app.get is for updating the addProduct data from database collection to the server
        app.get("/brand-products", async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // this is to get the one data which is going to be update from the update route
        app.get('/brand-products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        // this post is for adding new products to the database to product collection
        app.post('/brand-products', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct)
            const result = await productCollection.insertOne(newProduct)
            res.send(result);
        })
        // this is for updating the existing product from update routes
        app.put('/brand-products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedProduct = req.body
            const updatedNewProduct = {
                $set: {
                    productImg: updatedProduct.productImg,
                    productName: updatedProduct.productName,
                    brand: updatedProduct.brand,
                    ratings: updatedProduct.ratings,
                    price: updatedProduct.price,
                    productType: updatedProduct.productType,
                    description: updatedProduct.description,
                }
            }
            const result = await productCollection.updateOne(filter, updatedNewProduct, options)
            res.send(result);
        })

        // ========== this is to making the add to cart route ==============
        // this app.get is for updating the cart data from database collection to the server
        app.get("/carts", async (req, res) => {
            const cursor = cartsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/carts', async (req, res) => {
            const allCarts = req.body;
            console.log(allCarts)
            const result = await cartsCollection.insertOne(allCarts)
            res.send(result);
        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id}
            const result = await cartsCollection.deleteOne(query)
            res.send(result)
        })

        // app.delete('/carts/:id', async(req, res) => {
        //     const id = req.params.id;
        //     console.log(id)
        //     const query = {_id: new ObjectId(id)}
        //     const result = await cartsCollection.deleteOne(query)
        //     res.send(result)
        // })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




//==========================================


app.get('/', (req, res) => {
    res.send('Assignment-10 Sell-shop server is running')
})

app.listen(port, () => {
    console.log(`listening on port: ${port}`)
})

