const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        minlength: 6,
    },
    OTP: { type: String },
    OTPCreatedTime: { type: Date },
    OTPAttempts: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    blockUntil: { type: Date },
})
module.exports = mongoose.model("User", userSchema);
