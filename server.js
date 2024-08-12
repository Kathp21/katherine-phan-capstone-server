const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const dataRoutes = require('./routes/recommendations')
const userRoutes = require('./routes/user')
const itineraryRoutes = require('./routes/itinerary')
const passwordRoutes = require('./routes/password')

const allowedOrigins = ['http://localhost:3000', 'https://main--tripcrafters.netlify.app', 'https://tripcrafters.netlify.app'];

const corsOptions = {
    origin: function (origin, callback) {
        if(allowedOrigins.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allow by CORS'))
        }
    }
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/recommendations', dataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/password', passwordRoutes);

const PORT = process.env.PORT || 8080

// app.listen(PORT, () => {
//     console.log(`listening on port ${PORT}`)
// })

module.exports = app; // Export the app for serverless handling

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

