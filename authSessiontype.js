const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const User = require("./models/user");
const { isLoggedIn } = require("./middleware");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENABLE SESSION
app.use(
  session({
    secret: "super-secret-key", // change this in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true if using HTTPS
  })
);

// Set up EJS & views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// MongoDB Connect
mongoose
  .connect("mongodb://127.0.0.1:27017/Authentication")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Helpers
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}
async function verifyPassword(input, storedHash) {
  if (!input || !storedHash) {
    throw new Error("Missing input or stored hash");
  }
  return await bcrypt.compare(input, storedHash);
}

// Routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    req.session.userId = newUser._id;
    req.session.name = newUser.name;
    console.log("User registered:", email);
    return res.redirect("/blog");
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).send("Server error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) return res.status(401).send("Incorrect password");

    req.session.userId = user._id;
    req.session.name = user.name;
    res.redirect("/blog");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});

app.get("/blog", isLoggedIn, (req, res) => {
  res.render("index", { name: req.session.name });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(8080, () => {
  console.log("Server Listening at", 8080);
});
