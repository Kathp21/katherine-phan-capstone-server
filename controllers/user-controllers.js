// const knex = require("knex")(require("../knexfile"));
const knex =(require("../knexConfig"))
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { JWT_KEY } = process.env;

const register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: "All fields are required." })
    }
  
    try {
        // Check if user already exists
        const existingUser = await knex('users').where({ email }).first()
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." })
        }
  
        // Encrypt password asynchronously
        const hashedPassword = await bcrypt.hashSync(password);
  
        // Create the new user
        const newUser = { first_name, last_name, email, password: hashedPassword }
        const [newUserId] = await knex('users').insert(newUser);
  
        const token = jwt.sign({ id: newUserId }, JWT_KEY, { expiresIn: '2h' })
  
        res.status(201).json({ message: "Registered successfully", token, userId: newUserId })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to register due to an unexpected error." })
    }
}

const login = async ( req, res ) => {
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
}

//Get current user 
const currentUser = async (req, res) => {
    try {
        const user_id = req.user.id;
        if (!user_id) {
          return res.status(400).json({ message: "User ID is required" })
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
}

//Get title for the itinerary
const itineraryTitle = async ( req, res ) => {
    try {
        const user_id = req.user.id;
        if (!user_id) {
          return res.status(400).json({ message: "User ID is required" })
        }
    
        const title = await knex('itinerary')
          .where('user_id', '=', user_id)
          .groupBy('recommendation_id', 'title') // Group by uuid and title to ensure unique titles per batch
          .select('title', 'recommendation_id')
        
        if (title.length === 0) {
          return res.status(404).json({
            message: `No title found for user with ID ${user_id}`
          })
        }
        res.json(title)
    } catch (error) {
        res.status(500).json({
          message: `Unable to retrieve title for user with ID ${user_id}` 
        })
    }
}

module.exports = {
    register,
    login,
    currentUser,
    itineraryTitle,
}