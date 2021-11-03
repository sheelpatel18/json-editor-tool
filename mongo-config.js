const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017/local");
client.connect()
const db = client.db("local")

db.createCollection("system")
db.createCollection("json")

db.collection("system").insertOne({
    _id: "HIERARCHY",
    data : {}
}).then((doc) => {
    console.log("Setup Successful")
}).catch(err => { throw err })