const express = require('express');
const cors = require('cors')
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017/local");
client.connect()
const db = client.db("local")
const system = db.collection("system")
const schemas = db.collection("json")

const corsConfig = {
    "origin": "*",
    "methods": "*",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "allowedHeaders": ["Content-Type", "Authorization"]
}

const app = express();
app.use(express.json());
app.use(cors(corsConfig))

async function updateHierarchy(route = null, type = null, id = null, remove = false) {
    try {
        if (!route) throw "Route cannot be null"
        console.log(route, type, id, remove)
        const hierarchy = await system.findOne({ _id: "HIERARCHY" })
        var adjustmentHierarchy = hierarchy.data
        const routeArr = route.split("/").slice(1)
        routeArr.forEach(path => {
            if (!adjustmentHierarchy[path]) adjustmentHierarchy[path] = {}
            if (path == routeArr[routeArr.length - 1] && type == "ROUTE" && remove) delete adjustmentHierarchy[path]
            adjustmentHierarchy = adjustmentHierarchy[path]
        })
        if (type == "ROUTE" && remove) delete adjustmentHierarchy
        if (remove && type != "ROUTE") delete adjustmentHierarchy[type]
        if (!remove && type && id) adjustmentHierarchy[type] = id
        await system.updateOne({ _id: "HIERARCHY" }, { $set: hierarchy })
        return hierarchy
    } catch (err) { console.log(err) }
}

async function getResponse(route, type) {
    try {
        if (!(route && type)) throw "Route and type cannot be null"
        const hierarchy = await system.findOne({ _id: "HIERARCHY" })
        const routeArr = route.split("/").slice(2)
        var response = hierarchy.data
        routeArr.forEach(path => {
            if (!response[path]) return null
            response = response[path]
        })
        const id = response[type]
        const json = await schemas.findOne({ _id: ObjectId(id) })
        return json.data
    } catch (err) {
        console.log(err)
        return null
    }
}

app.route("/hierarchy")
    .get((req, res) => {
        try {
            system.find({ _id: "HIERARCHY" }).toArray().then(docs => {
                res.status(200).json((docs[0]))
            }).catch(err => { throw err })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })
    .post((req, res) => {
        const route = req.query.route
        try {
            if (!route) throw "No route specified"
            updateHierarchy(route).then(hierarchy => {
                res.status(200).json(hierarchy)
            }).catch(err => { throw err })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })
    .delete((req, res) => {
        const route = req.query.route
        const type = "ROUTE"
        try {
            if (!route) throw "No route specified"
            updateHierarchy(route, type, null, true).then(hierarchy => {
                res.status(200).json(hierarchy)
            }).catch(err => { throw err })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })

app.route("/schemas")
    .get((req, res) => {
        try {
            schemas.find({}).toArray().then(docs => {
                var docsFormatted = {}
                docs.forEach(doc => docsFormatted[doc._id] = doc)
                res.send(docsFormatted)
            }).catch(err => { throw err })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })
    .post((req, res) => {
        try {
            schemas.insertOne({
                data: req.body.data,
                metaData : {
                    route: req.body.route,
                    request_type: req.body.request_type
                }
            }).then((doc) => {
                updateHierarchy(req.body.route, req.body.request_type, ObjectId(doc.insertedId).toString())
                res.status(200).json({ message: "SUCCESS" })
            }).catch(err => { throw err })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })

app.route("/schemas/:id")
    .get((req, res) => {
        try {
            schemas.find({ _id: ObjectId(req.params.id) }).toArray().then(docs => {
                res.status(200).json(docs[0].data)
            }).catch(err => { throw err })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })
    .put((req, res) => {
        try {
            schemas.updateOne({ _id: ObjectId(req.params.id) }, { $set: { metaData: {...req.body.metaData}, data : {...req.body.data} } }).then((doc) => {
                console.log(doc)
                res.status(200).json({ message: "SUCCESS" })
            }).catch(err => console.log(err))
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })
    .delete((req, res) => {
        try {
            schemas.findOneAndDelete({ _id: ObjectId(req.params.id) }).then(doc => {
                updateHierarchy(doc.value.route, doc.value.request_type, ObjectId(doc.value._id).toString(), true).then(hierarchy => {
                    res.status(200).json({ message: "SUCCESS", hierarchy: hierarchy })
                }).catch(err => { throw err })
            }).catch(err => { throw err })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })


app.route("/mock/*")
    .all((req, res) => {
        try {
            getResponse(req.originalUrl, req.method).then(response => {
                res.status(200).json(response)
            })
        } catch (err) {
            res.status(500).json({ message: "INTERNAL SERVER ERROR", error: err })
        }
    })

app.listen(8092)