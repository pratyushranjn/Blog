require('dotenv').config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const User = require("./models/user");
const { generateToken, verifyToken } = require("./utils/jwt");
const { isLoggedIn, checkAuth } = require("./middleware");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/blog")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


// Routes
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).send("All fields required");

  try {
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT
    const token = generateToken(newUser._id, newUser.name);

    // Set token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only true on HTTPS
      maxAge: parseInt(process.env.COOKIE_EXPIRES), // 6 hours
    });

   // console.log("User ID:", newUser._id);

    // Redirect
    return res.redirect("/blog");
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).send("Internal server error");
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing credentials");

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");
   
    // Using bcrypt.compare with async/await
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Incorrect password");
    }

    // If password matches, generate JWT
    const token = generateToken(user._id, user.name); // Assuming generateToken is imported
    console.log(token);

    // Set token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only true on HTTPS
      maxAge: parseInt(process.env.COOKIE_EXPIRES), // Set max age from environment variable (6 hours)
    });

    // Redirect to blog or send a response (depending on your app flow)
    return res.redirect("/blog");
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).send("Server error");
  }
});



app.get("/blog", checkAuth, (req, res) => {
  res.render("index", { name: req.name || null });
});




app.get("/logout", (req, res) => {
  // Clear the JWT cookie
  res.clearCookie("token");
  res.redirect("/blog");
});


app.get("/", (req, res) => {
  res.redirect("/blog")
})


app.listen(3000, () => {
  console.log("Server Listening at", 3000);
});
