const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pmmxt7q.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    // Collection
     const db = client.db("volunteerDB"); 
     const posts = db.collection("volunter");
    const volunterCollection = client.db('volunter').collection('volunter');
    const requests = db.collection("volunteerRequests");

// ADD volunter information  server side theke client side Dekhano 
 
    app.get('/volunter',async(req,res)=>{
    const cursor = volunterCollection .find();
    const result = await cursor.toArray();
    res.send(result);
})
//  volunter post card er Detalies page dekhano 
 app.get('/volunter/:id', async(req, res) => {
  const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await volunterCollection.findOne(query);
    res.send(result);

})

    // ADD volunter information sent to server side & Backend 
    app.post('/volunter', async (req, res) => {
      const newvolunter = req.body;
      console.log("Received:", newvolunter);
      const result = await volunterCollection.insertOne(newvolunter);
      res.send(result);
    });

// my volunter need post section theke delete 
app.delete("/volunter/:id", async (req, res) => {
  const id = req.params.id;
  const result = await volunterCollection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount > 0) {
    res.status(200).json({ message: "Post deleted successfully" });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// my volunter need post section theke data Updated  
app.put("/volunter/:id", async (req, res) => {
  const id = req.params.id;
  const result = await volunterCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
  res.send(result);
});


// To be a Volunter Button 
app.post("/volunteerRequests", async (req, res) => {
  const r = await requests.insertOne(req.body);
  await posts.updateOne({ _id: new ObjectId(req.body.postId) }, { $inc: { volunteersNeeded: -1 } });
  res.send(r);
});

// to be volunter Request 
app.get("/volunteerRequests", async (req, res) => {
  try {
    const allRequests = await requests
      .find(req.query.volunteerEmail ? { volunteerEmail: req.query.volunteerEmail } : {})
      .toArray();
    res.send(allRequests);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// Delete a request
app.delete("/volunteerRequests/:id", async (req, res) => {
  const { id } = req.params;
  const result = await requests.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});


// Get upcoming 6 posts by deadline


// 6 ta upcoming posts
app.get("/upcomingPosts", async (req, res) => {
  try {
    const posts = await volunterCollection.find().toArray();

    const upcoming = posts
      .filter(post => new Date(post.deadline) >= new Date()) 
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);

    res.send(upcoming);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
 app.get('/', (req, res) => {
      res.send('Volunteer management server is running...');
    });

   
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);


















































