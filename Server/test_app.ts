import express from 'express'
const app = express()

import api from "./api"

app.use("/" , api)


app.listen(3000, () => {
    console.log("listening on port 3000")
})