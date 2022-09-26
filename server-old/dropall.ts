// helper script to drop all collections
import { MongoClient, Collection, Document, ObjectId, Timestamp } from 'mongodb';
import { MongoDB_URI } from "./env";
const client = new MongoClient(MongoDB_URI);
await client.connect();
const database = client.db("database");
try {
	database.collection("posts").drop();
	database.collection("comments").drop();
	database.collection("users").drop();
	database.collection("auth").drop();
	database.collection("groups").drop();
	database.collection("groupUsers").drop();
	database.collection("follows").drop();
	database.collection("votes").drop();
} catch (e: any) {
	// console.log(e.message)
}
console.log("all done")