const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;

const authorize = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
      return res.status(401).json({ message: "Authorization header is required" })
    }
    const token = authorization.split(" ")[1]
    try {
      const payload = jwt.verify(token, JWT_KEY)
      req.user = payload

      console.log("Payload:", payload)
      next();
    } catch(err) {
      return res.status(401).json({ message: "Invalid JWT: " + err.message })
    }
  }


module.exports = authorize;