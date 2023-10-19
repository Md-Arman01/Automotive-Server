const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// middleWare
app.use(cors())
app.use(express.json())
// ----


// connect to mongodb clusterO

const uri = `mongodb+srv://${process.env.BRAND_NAME}:${process.env.PROJECT_PASSWORD}@cluster0.kplqqe8.mongodb.net/?retryWrites=true&w=majority`;
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
    // brand collection
    const brandCollections = client.db("brandDB").collection("brands")
    const productsCollection = client.db("productsDB").collection("products")


    app.get('/brands', async(req, res)=> {
      const cursor = brandCollections.find();
      const result = await cursor.toArray()
      res.send(result)
    })
    
    app.get('/brands/:id', async(req, res)=>{
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await brandCollections.findOne(query);
      res.send(result)
    })
    // -----

    
    // get
    app.get('/products', async(req, res)=> {
      const cursor = productsCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })
    // -----

    

    // post
    app.post('/products', async(req, res) => {
      const addProduct = req.body;
      const result = await productsCollection.insertOne(addProduct)
      res.send(result)
    })



    // -------

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ----------------------







// Simple set-up
app.get('/', (req, res) => {
    res.send('Server Side Is Running Now')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })