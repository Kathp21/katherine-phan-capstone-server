const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const dataRoutes = require('./routes/recommendations')
const userRoutes = require('./routes/user')
const itineraryRoutes = require('./routes/itinerary')
const passwordRoutes = require('./routes/password')

const corsOptions = {
    origin: 'https://main--tripcrafters.netlify.app',
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/recommendations', dataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/password', passwordRoutes);

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
