const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

// > need to remove this before deployment
const os = require("os");
// Function to get the local IP address
function getLocalIP() {
	const interfaces = os.networkInterfaces();
	const addresses = [];

	for (let k in interfaces) {
		for (let k2 in interfaces[k]) {
			const address = interfaces[k][k2];
			if (address.family === "IPv4" && !address.internal) {
				addresses.push(address.address);
			}
		}
	}

	// console.log("Local IP Address:", addresses);
	return addresses[0];
}
// Call the function to get the local IP address
// getLocalIP();

const ip = process.env.IP || getLocalIP();
// const ip = process.env.IP || "192.168.0.109";
//

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zxotz8q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

		const coffeeCollection = client.db("coffeeDB").collection("coffee");

		app.get("/coffee", async (req, res) => {
			const result = await coffeeCollection.find().toArray();
			res.send(result);
		});

		app.get("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeeCollection.findOne(query);
			res.send(result);
		});

		app.post("/coffee", async (req, res) => {
			const newCoffee = req.body;
			console.log(`newCoffee:`, newCoffee);
			const result = await coffeeCollection.insertOne(newCoffee);
			res.send(result);
		});

		app.put("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const updatedCoffee = req.body;
			const filter = { _id: new ObjectId(id) };
			const option = { upsert: true };
			const update = {
				$set: {
					name: updatedCoffee.name,
					quantity: updatedCoffee.quantity,
					supplier: updatedCoffee.supplier,
					taste: updatedCoffee.taste,
					category: updatedCoffee.category,
					details: updatedCoffee.details,
					photo: updatedCoffee.photo,
				},
			};
			const result = await coffeeCollection.updateOne(filter, update, option);
			res.send(result);
		});

		app.delete("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeeCollection.deleteOne(query);
			res.send(result);
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

app.get("/", (req, res) => {
	res.send("coffee making server is running");
});

// app.listen(port, () => {
// 	console.log(`Coffee server is listening on ${port}`);
// });

// > need to remove this before deployment
app.listen(port, ip, () => {
	console.log(`server is listening on http://${ip}:${port}`);
});
