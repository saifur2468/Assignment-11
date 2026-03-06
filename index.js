const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pmmxt7q.mongodb.net/volunteerDB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("volunteerDB");
    const postsCollection = db.collection("posts");
    const requestsCollection = db.collection("requests");

    // Admin middleware
    function isAdmin(req, res, next) {
      const email = req.query.email || req.body.email;
      if (email === "mdislamshakib218@gmail.com") next();
      else res.status(403).send({ message: "Not authorized" });
    }

    // Create Post
    app.post("/posts", async (req, res) => {
      const newPost = req.body;
      const result = await postsCollection.insertOne(newPost);
      res.send(result);
    });

    // Get All Posts
    app.get("/posts/all", async (req, res) => {
      const posts = await postsCollection.find({}).toArray();
      res.send(posts);
    });

    // Get My Posts
    app.get("/posts", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email required" });

      const posts = await postsCollection.find({ organizerEmail: email }).toArray();
      res.send(posts);
    });

    // Update Post
    app.put("/posts/:id", async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;
      let filter = { _id: new ObjectId(id) };
      if (email !== "mdislamshakib218@gmail.com") filter.organizerEmail = email;

      const result = await postsCollection.updateOne(filter, { $set: req.body });
      if (result.matchedCount === 0) return res.status(403).send({ message: "Not authorized" });
      res.send(result);
    });

    // Delete Post
    app.delete("/posts/:id", async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;
      let filter = { _id: new ObjectId(id) };
      if (email !== "mdislamshakib218@gmail.com") filter.organizerEmail = email;

      const result = await postsCollection.deleteOne(filter);
      if (result.deletedCount === 0) return res.status(403).send({ message: "Not authorized" });
      res.send({ message: "Post deleted successfully" });
    });

    // Volunteer Request
    app.post("/requests", async (req, res) => {
      const { postId, volunteerEmail } = req.body;
      const result = await requestsCollection.insertOne({ postId, volunteerEmail, status: "pending", createdAt: new Date() });
      res.send(result);
    });

    // Get My Requests
    app.get("/my-requests", async (req, res) => {
      const email = req.query.volunteerEmail;
      const requests = await requestsCollection.find({ volunteerEmail: email }).toArray();
      res.send(requests);
    });

    // Cancel Request
    app.delete("/cancel-request/:id", async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;
      const result = await requestsCollection.deleteOne({ _id: new ObjectId(id), volunteerEmail: email });
      if (result.deletedCount === 0) return res.status(403).send({ message: "Not authorized" });
      res.send({ message: "Request cancelled" });
    });

    // Admin: Get All Requests
    app.get("/all-requests", isAdmin, async (req, res) => {
      const requests = await requestsCollection.find({}).toArray();
      res.send(requests);
    });

    // Admin: Update Request Status
    app.put("/requests/:id/status", isAdmin, async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const result = await requestsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
      res.send(result);
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);