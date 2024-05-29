const router = require("express").Router();
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { JWT_KEY } = process.env;
const authorize = require('../middleware/authorize') 


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

      // const token = jwt.sign({ id: newUserId }, JWT_KEY );


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

    // const token = jwt.sign({ id: user.id }, JWT_KEY );

    res.status(201).json({ message: "Login successfully", token: token });
})

//Logout 
router.post('logout', authorize, (req, res) => {
  res.status(201).json({message: 'Login successful', token})
})

router.get("/current", authorize, async (req, res) => {
  res.status(200).json(`Welcome back, ${req.user.first_name}`)
});

router.get("/current/lastname", authorize, async (req, res) => {
  res.status(200).json(`Welcome back, ${req.user.last_name}`)
});

router.post('/save-itinerary', authorize, async (req, res) => {
  const itineraries = req.body.itinerary;
  const title = req.body.title;
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
                title: title,
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

// router.get('/verify-token', authorize, (req, res) => {
//   // If the token is verified successfully, the middleware will allow this route to proceed
//   console.log(req.user)
//   res.status(200).json({ message: "Token is valid", user: req.user });
// });


router.get('/current-user', authorize, async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const currentUser = await knex('users')
      .where('id', '=', user_id)
    if(currentUser.length === 0){
      return res.status(404).json({
        message: `User with ID ${user_id} not found`
      })
    }
    const userData = currentUser[0]
    res.json(userData)
  }catch(error) {
    res.status(500).json({
        message: `Unable to retrieve user data for user with ID `, 
    })
  }
})

router.get('/current-user/itinerary-title', authorize, async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const title = await knex('itinerary')
      .where('user_id', '=', user_id)
      .groupBy('recommendation_id', 'title') // Group by uuid and title to ensure unique titles per batch
      .select('title', 'recommendation_id');
    
    if (title.length === 0) {
      return res.status(404).json({
        message: `No title found for user with ID ${user_id}`
      });
    }
    res.json(title)
  } catch (error) {
    console.error('Error fetching title:', error); // Debugging
    res.status(500).json({
      message: `Unable to retrieve title for user with ID ${user_id}` 
    });
  }
})


router.get('/current-user/itineraries', authorize, async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Query the 'itinerary' table to find entries where 'recommendation_id' matches 'user_id'
    const itineraries = await knex('itinerary')
      .where('user_id', '=', user_id)
      .select('*'); // Select all fields, adjust if specific fields are needed

    // Check if no itineraries were found for the user
    if (itineraries.length === 0) {
      return res.status(404).json({
        message: `No itineraries found for user with ID ${user_id}`
      });
    }

    // Send the list of itineraries
    res.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error); // Debugging
    res.status(500).json({
      message: `Unable to retrieve itineraries for user with ID ${user_id}` 
    });
  }
});


router.get('/current-user/itinerary-details/:recommendation_id', authorize, async (req, res) => {
  try {
    const user_id = req.user.id;
    const recommendation_id = req.params.recommendation_id;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!recommendation_id) {
      return res.status(400).json({ message: "Recommendation ID is required" });
    }

    console.log('User ID:', user_id); // Debugging
    console.log('Recommendation ID:', recommendation_id); // Debugging

    const details = await knex('itinerary')
      .where({
        user_id: user_id,
        recommendation_id: recommendation_id
      })
      .select('*');
    
    if (details.length === 0) {
      return res.status(404).json({
        message: `No itinerary details found for user with ID ${user_id} and recommendation ID ${recommendation_id}`
      });
    }

    res.json(details);
  } catch (error) {
    console.error('Error fetching itinerary details:', error); // Debugging
    res.status(500).json({
      message: `Unable to retrieve itinerary details for user with ID ${user_id} and recommendation ID ${recommendation_id}`
    });
  }
});



module.exports = router;


