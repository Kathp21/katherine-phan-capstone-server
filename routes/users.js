const router = require("express").Router();
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { JWT_KEY } = process.env;

const authorize = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ message: "Authorization header is required" });
    }
    const token = authorization.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_KEY);
      req.user = payload;

      console.log("Payload:", payload);
      next();
    } catch(err) {
      return res.status(401).json({ message: "Invalid JWT: " + err.message });
    }
  }

router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
  }

  try {
      // Check if user already exists
      const existingUser = await knex('users').where({ email }).first();
      if (existingUser) {
          return res.status(409).json({ message: "User already exists." });
      }

      // Encrypt password asynchronously
      const hashedPassword = await bcrypt.hashSync(password);

      // Create the new user
      const newUser = { first_name, last_name, email, password: hashedPassword };
      const [newUserId] = await knex('users').insert(newUser);

      console.log("New user ID:", newUserId);

      const token = jwt.sign({ id: newUserId }, JWT_KEY, { expiresIn: '2h' });

      res.status(201).json({ message: "Registered successfully", token, userId: newUserId });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to register due to an unexpected error." });
  }
});

router.post('/login', async (req, res) => {
    //Validate request
    const { email, password } = req.body
    //Find the user
    const user = await knex('users').where({ email: email }).first()
    if(!user) {
        return res.status(400).send('no such user')
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    if(!isPasswordCorrect) {
        return res.status(400).send("Invalid password")
    }

    //Generate token
    const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '2h' });

    res.status(201).json({ message: "Login successfully", token: token });
})

router.get("/current", authorize, async (req, res) => {
  res.status(200).json(`Welcome back, ${req.user.first_name}`)
});

router.get("/current/lastname", authorize, async (req, res) => {
res.status(200).json(`Welcome back, ${req.user.last_name}`)
});

router.post('/save-itinerary', authorize, async (req, res) => {
  const itineraries = req.body.itinerary;
  const userId = req.user.id; // Ensure you have user ID from JWT or session
  console.log(userId)
  console.log(req.body)
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  if (!itineraries || itineraries.length === 0) {
      return res.status(400).json({ message: "No itinerary data provided." });
  }

  // Check for any missing fields in any itinerary
  const invalidEntry = itineraries.find(itinerary => 
      !itinerary.day_string || !itinerary.location || !itinerary.duration ||
      !itinerary.budget || !itinerary.description
  );

  if (invalidEntry) {
      return res.status(400).json({ message: "All fields must be provided.", invalidEntry });
  }

  try {
      // Use transaction for batch inserting
      await knex.transaction(async trx => {
        const recommendationId = uuidv4(); // Generate a UUID for this batch of itineraries
          for (const item of itineraries) {
              await trx('itinerary').insert({
                recommendation_id: recommendationId, 
                day_string: item.day_string,
                location: item.location,
                duration: item.duration,
                budget: item.budget.replace('$', ''), // Removing dollar sign before saving
                description: item.description,
                user_id: userId
              });
          }
      });
      res.status(201).json({ message: "Itinerary saved successfully" });

  } catch (error) {
      console.error('Save Itinerary Error:', error);
      res.status(500).json({ message: 'Failed to save itinerary' });
  }
})

router.get('/verify-token', authorize, (req, res) => {
  // If the token is verified successfully, the middleware will allow this route to proceed
  console.log(req.user)
  res.status(200).json({ message: "Token is valid", user: req.user });
});



module.exports = router;