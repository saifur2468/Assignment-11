// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pmmxt7q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1 } });

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("volunteerDB");
    const volunterCollection = db.collection("volunter");

    // =========================
    // ADD POST
    // =========================
    app.post("/volunter", async (req, res) => {
      const newPost = req.body;
      if (!newPost.organizerEmail) {
        return res.status(400).send({ message: "Organizer email required" });
      }

      const result = await volunterCollection.insertOne(newPost);
      res.send(result);
    });

    // =========================
    // GET MY POSTS (BY EMAIL)
    // =========================
    app.get("/volunter/my-posts", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email required" });

      const posts = await volunterCollection.find({ organizerEmail: email }).toArray();
      res.send(posts);
    });

    // =========================
    // DELETE POST (BY EMAIL)
    // =========================
    app.delete("/volunter/:id", async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email required" });

      const result = await volunterCollection.deleteOne({
        _id: new ObjectId(id),
        organizerEmail: email,
      });

      if (result.deletedCount === 0)
        return res.status(403).send({ message: "Not authorized" });

      res.send({ message: "Post deleted successfully" });
    });

    // =========================
    // UPDATE POST (BY EMAIL)
    // =========================
    app.put("/volunter/:id", async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email required" });

      const result = await volunterCollection.updateOne(
        { _id: new ObjectId(id), organizerEmail: email },
        { $set: req.body }
      );

      if (result.matchedCount === 0)
        return res.status(403).send({ message: "Not authorized" });

      res.send(result);
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);













