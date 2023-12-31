const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');// jst practice 
var cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 5000;

// middleWare
app.use(cors({
  origin: ['https://automotive-brandshop.web.app', 'https://automotive-brandshop.firebaseapp.com'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
// ----

// custom middleware
const verifyToken = async(req, res, next) => {
   const token = req.cookies.token;
   console.log('ttt token', token)
   if(!token){
    return res.status(401).send({message: "not authorized"})
  }
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN , (err, decoded)=> {
    if(err){
      console.log(err)
      return res.status(401).send({message: "unAuthorized"})
      }
      console.log('value in the token', decoded)
      req.user = decoded
      next()
  });

}




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
    const myCartCollection = client.db("myCartDB").collection("myCart")


    //auth token api

    app.post('/jwt', async(req, res)=> {
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user , process.env.ACCESS_SECRET_TOKEN , { expiresIn: '1h' });
      
      res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true})
    })

    app.post('/logout', async(req, res)=> {
      const user = req.body
      res.clearCookie('token', {secure: true, sameSite: 'none'}).send({success: true})
    })






      //server api

      // post
      app.post('/products', async(req, res) => {
        const addProduct = req.body;
        const result = await productsCollection.insertOne(addProduct)
        res.send(result)
      })
      app.post('/myCart', async(req, res)=> {
        const addProduct = req.body;
        const result = await myCartCollection.insertOne(addProduct)
        res.send(result)
      })
  
    // get
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
    app.get('/products', async(req, res)=> {
      const cursor = productsCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/products/:brand_name', async(req, res)=> {
      const brand_name = req.params.brand_name;
      const query = {brand: brand_name}
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/products/:brand_name', async(req, res)=> {
      const brand_name = req.params.brand_name;
      const query = {brand: brand_name}
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/myCart/:email', verifyToken,  async(req, res)=> {
      console.log('user in the valid token' , req.user)
      if(req.params.email !== req.user.email){
          return res.status(403).send({message: 'forbidden access'})
      }

      const email = req.params.email;
      const query = {email: email}
      const cursor = myCartCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
    // -----
  

    //-----
    // update
    app.put('/products/:id', async(req, res)=> {
      const product = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) } 
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          photoURL : product.photoURL,
          name : product.name,
          brand : product.brand,
          type : product.type,
          price : product.price,
          rating : product.rating,
        },
      };
      const result = await productsCollection.updateOne(filter, updateDoc, options);
      res.send(result);

    })
    // delete
    app.delete('/myCart/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await myCartCollection.deleteOne(query);
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