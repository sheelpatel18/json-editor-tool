import express from 'express';
import cors from 'cors';
import settings from "../settings.json"
import https from 'https';
import http from 'http';
import { Document, DatabaseType } from './src/ts/Database';

const corsConfig = {
    "origin": "*",
    "methods": "*",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "allowedHeaders": ["Content-Type", "Authorization"] // might add user management in the future
}

const {
    HOST,
    PORT,
    SSL,
    DATABASE_TYPE
} = settings;

console.log(DATABASE_TYPE)
console.log(DatabaseType.Firestore.toString())

if (![DatabaseType.DynamoDB, DatabaseType.Firestore, DatabaseType.Mongo].map(type => type.toString()).includes(DATABASE_TYPE)) {
    throw new Error("NOT A VALID DATABASE TYPE")
}

Document.databaseInit(DATABASE_TYPE);

const app = express();
app.use(express.json());
app.use(cors(corsConfig))

app.use("/hierarchy", require("./apiRoutes/hierarchy/root.js"));
app.use("/mock/*", require("./apiRoutes/mock/root.js"));
app.use("/schemas", require("./apiRoutes/schemas/root.js"));

if (SSL) {
    https.createServer(app).listen(PORT, () => {
        console.log(`Listening on port ${PORT} at ${HOST}`);
    });
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`Listening on port ${PORT} at ${HOST}`);
    });
}