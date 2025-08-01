const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(express.json());
app.use(cors());

// !Mongodb Database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.56yvv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // !mongodb collections
    const db = client.db("RouteXpress-Db");

    const userCollection = db.collection("users");
    const bookedPercelCollection = db.collection("booked-percels");
    const selectedDeliveryAgentCollection = db.collection(
      "selected-deliveryAgent"
    );

    // -------------- user related api
    app.post("/api/users", async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;

      // varify user
      if (!email) {
        return res.status(400).send({ meassage: "Email Is Required" });
      }

      // if User is already exist
      const existingUser = await userCollection.findOne({ email });

      if (existingUser) {
        return res
          .status(200)
          .send({ meassage: "User Already Exist in database" });
      }

      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // find all users
    app.get("/api/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // update user role

    app.patch("/api/users/update-role/:email", async (req, res) => {
      const data = req.body;
      const role = data.role;
      const email = req.params.email;
      const filter = { email };

      const updatedDoc = {
        $set: {
          role: role,
        },
      };

      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // ------------------ booking percel related api
    app.post("/api/book-percel", async (req, res) => {
      const data = req.body;

      const result = await bookedPercelCollection.insertOne(data);
      res.send(result);
    });

    // find all percel
    app.get("/api/book-percel", async (req, res) => {
      const result = await bookedPercelCollection.find().toArray();
      res.send(result);
    });

    //--------------------- selected delivry_Agent

    app.post("/api/select-deliveryAgent", async (req, res) => {
      const data = req.body;
        const result = await selectedDeliveryAgentCollection.insertOne(data);
        res.send(result)
    });

        // get all data wich send to delivery agent 

      app.get("/api/select-deliveryAgent", async (req, res) => {
      const result = await selectedDeliveryAgentCollection.find().toArray();
      res.send(result);
    });


    // --------------------- update percel status
   const { ObjectId } = require("mongodb");

app.patch('/api/change-percel-status', async (req, res) => {
  try {
    const { delivery_Agent_collection_id, percelId, status } = req.body;

    const bookedPercelId = { _id: new ObjectId(percelId) };
    const deliveryAgentId = { _id: new ObjectId(delivery_Agent_collection_id) };

    // Update booked-percels status
    const updateBookedResult = await bookedPercelCollection.updateOne(
      bookedPercelId,
      { $set: { status: status } }
    );

    // Update selected-deliveryAgent collection status
    const updateAgentResult = await selectedDeliveryAgentCollection.updateOne(
      deliveryAgentId,
      { $set: { status: status } }
    );

    const result = {
      bookedPercel: updateBookedResult,
      deliveryAgent: updateAgentResult
    };

    res.send(result);

  } catch (error) {
    console.error("Error updating percel status:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("RouteXpress server is running");
});

app.listen(port, () => {
  console.log("RouteXpress server is running on port", port);
});
