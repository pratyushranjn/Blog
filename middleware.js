// Sessions Middleware
// function isLoggedIn(req, res, next) {
//     if (!req.session || !req.session.userId) {
//       return res.redirect("/login");
//     }
//     next();
//   }
  



// JWT Middleware
const { verifyToken } = require("./utils/jwt");

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
      req.name = decoded.name;
    }
  }

  next(); // Always proceed, even if not logged in
};


const isLoggedIn = (req, res, next) => {
  // Check if token exists in cookie
  const token = req.cookies.token;
  
  if (!token) {
    res.redirect("/login")
  }
  
  // Verify the token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).send("Invalid or expired token");
  }
  console.log("Decoded token:", decoded)
  // Attach the userId and name to the request object for further use
  req.userId = decoded.userId;
  req.name = decoded.name;  // Attach the name to req object
  
  next();  // Proceed to the next middleware/route handler
};


module.exports = { isLoggedIn, checkAuth };