const router = require("express").Router();
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
const { JWT_KEY } = process.env;

const authorize = (req, res, next) => {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_KEY);
      req.user = payload;
      next();
    } catch(err) {
      return res.status(401).json("Invalid JWT");
    }
  }

  router.post("/register", async (req, res) => {
    console.log(req.body)

    // Validate request
    const {
      first_name,
      last_name,
      email,
      password
    } = req.body

    //Encrypt password
    const hashedPassword = bcrypt.hashSync(password)

    //Create the new user
    let newUser = {
        first_name,
        last_name,
        email,
        password: hashedPassword
    }

    try {
        await knex('users').insert(newUser)
        res.status(201).send("Registered successfully")
    }catch(err) {
        res.status(400).send("Failed registration.")
      }
})

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

    //Generate a token
    const token = jwt.sign(
        { email: user.email }, JWT_KEY
    )

    res.status(200).json(token)
})

// router.get("/current", authorize, async (req, res) => {
//     res.status(200).json(`Welcome back, ${req.user.email}`);
// });

router.get("/current", authorize, async (req, res) => {
  res.status(200).json(`Welcome back, ${req.user.first_name}`)
});

router.get("/current/lastname", authorize, async (req, res) => {
res.status(200).json(`Welcome back, ${req.user.last_name}`)
});


module.exports = router;