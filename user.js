const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalFocusTime: { type: Number, default: 0 }
});

const user = mongoose.model('User', userSchema);
module.exports = user;