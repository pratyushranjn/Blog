const jwt = require("jsonwebtoken");

// JWT generator function
const generateToken = (userId, name) => {
  const token = jwt.sign({ userId, name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  //console.log("Generated Token:", token);
  return token;
};


// JWT verification function
const verifyToken = (token) => {

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verifies the token using the secret
    console.log("Decoded Token:", decoded);
    return decoded;  // Returns the decoded information (usually user ID)
  } catch (err) {
    console.log("Token verification failed:", err);
    return null;  // Return null if verification fails
  }
};


module.exports = { generateToken, verifyToken };
