const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//otp is only sent on email for now
const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
      maxlength: [4, "otp must be exactly 4 digits"],
      minlength: [4, "otp must be exactly 4 digits"],
      validate: {
        validator: (value) => /^[0-9]{4}$/.test(value),
        message: "OTP must be a 4-digit number.",
      },
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
      maxlength: [
        50,
        "email address length can not be greater than 50 characters",
      ],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now delete automatically
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const OtpModel = mongoose.model("Otp", otpSchema);

module.exports = OtpModel;
