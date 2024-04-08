const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()
const dataRoutes = require('./routes/recommendations')


app.use(cors())
app.use(express.json())

app.use('/api/chat-completion', dataRoutes)
// app.use('api.clickup.com/v2', dataRoutes)

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
