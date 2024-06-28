const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()
const dataRoutes = require('./routes/recommendations')
const userRoutes = require('./routes/user')
const itineraryRoutes = require('./routes/itinerary')
const passwordRoutes = require('./routes/password')

app.use(cors())
app.use(express.json())

// app.use('/api/chat-completion', dataRoutes)
// app.use('/api/chat-completion', userRoutes)
// app.use('/api/chat-completion', itineraryRoutes)
// app.use('/api/chat-completion', passwordRoutes)

app.use('/api/recommendations', dataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/password', passwordRoutes);

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
