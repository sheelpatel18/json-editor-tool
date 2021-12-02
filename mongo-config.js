const key = require("node-key-sender")
const { MongoClient } = require("mongodb");
const { DB_PORT } = require("./config");
const client = new MongoClient(`mongodb://localhost:${DB_PORT}/local`);


console.log("STARTING DB SETUP.....")

async function setup() {
    await client.connect()
    const db = client.db("local")
    await db.createCollection("system")
    console.log("System Collection Created")
    await db.createCollection("json")
    console.log("JSON collection created")
    await db.collection("system").insertOne({
        _id: "HIERARCHY",
        data : {}
    })
    console.log("Default hierarchy document created")
    console.log("Done! Closing DB connection....")
    await client.close()

}

setup().then(() => {
    key.sendCombination(['control', 'c'])
    console.log("SETUP COMPLETE!")
}).catch(err => {
    key.sendCombination(['control', 'c'])
    console.log("SETUP FAILED....")
    console.log(err)
})