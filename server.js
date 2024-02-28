const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()
const dataRoutes = require('./routes/recommendations')
const userRoutes = require('./routes/users')
const itineraryRoutes = require('./routes/itinerary')


app.use(cors())
app.use(express.json())

app.use('/api/chat-completion', dataRoutes)
app.use('/api/chat-completion', userRoutes)
app.use('/api/chat-completion', itineraryRoutes)

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
