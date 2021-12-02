const express = require('express')
const path = require('path')
const app = express()
const port = 8091
app.use(express.static(path.join(__dirname, './build')))
const { APP_PORT } = require("../../config.js")

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'))
})

app.listen(APP_PORT)