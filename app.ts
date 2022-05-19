import express from 'express'
import api from "./Server/api"
import settings from "./settings.json"
import cors from 'cors'
import helmet from 'helmet'
import https from 'https'
import http from 'http'

const {
    HOST,
    PORT,
    SSL
} = settings;

const corsConfig = {
    "origin": "*",
    "methods": "*",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "allowedHeaders": ["Content-Type", "Authorization"] // might add user management in the future
}

const app = express()
app.use(express.json());
app.use(cors(corsConfig))
app.use(helmet())

app.use("/api", api)

if (SSL) {
    https.createServer(app).listen(PORT, () => {
        console.log(`Listening on port ${PORT} at ${HOST}`);
    });
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`Listening on port ${PORT} at ${HOST}`);
    });
}