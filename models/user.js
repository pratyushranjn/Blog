const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Removes whitespace from both ends
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Ensures email is stored in lowercase
        match: [/.+@.+\..+/, 'Please fill a valid email address'], // Basic email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum length for password
    }
}, { timestamps: true });


// Create the User model
const User = mongoose.model('User ', UserSchema);

// Export the User model
module.exports = User;