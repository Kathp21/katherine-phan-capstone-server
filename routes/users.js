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

//   router.post("/register", async (req, res) => {
//     console.log(req.body)

//     // Validate request
//     const {
//       first_name,
//       last_name,
//       email,
//       password
//     } = req.body

//     //Encrypt password
//     const hashedPassword = bcrypt.hashSync(password)

//     //Create the new user
//     let newUser = {
//         first_name,
//         last_name,
//         email,
//         password: hashedPassword
//     }

//     try {
//         const newAddedUser = await knex('users').insert(newUser)
        
//         //Generate a token
//         const token = jwt.sign(
//           { email: newAddedUser.email }, JWT_KEY
//         )

//         console.log(token)

//         // res.status(201).send("Registered successfully")
//         res.status(201).json({ message: "Registered successfully", token: token });
//     }catch(err) {
//         res.status(400).send("Failed registration.")
//       }
// })

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
      const [newUserId] = await knex('users').insert(newUser)

      console.log("New user ID:", newUserId);

       res.status(201).send("Registered successfully")

      // // Generate a token
      // const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: '2h' });

      // console.log("LOGGING TOKEN")
      // console.log(token);
      // res.status(201).json({ message: "Registered successfully", token: token });
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

    //Generate a token
    const token = jwt.sign(
        { email: user.email }, JWT_KEY
    )

    console.log(token);

    res.status(201).json({ message: "Login successfully", token: token });
    // res.status(200).send("Logined")
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