const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const handleDuplicateKeyError = require("../helper/errorValidations");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9\s]+$/,
      maxlength: [
        20,
        "first name length can not be greater than 20 characters",
      ],
    },
    lastName: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9\s]+$/,
      maxlength: [20, "last name length can not be greater than 20 characters"],
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "others"],
        message: () => `mention ${this.path} value is not allowed`,
      },
      index: true,
    },

    keySkills: {
      //index is created below
      type: [String],
      // required: true,
      // validate: [
      //   {
      //     validator: (skills) => !skills || skills.length >= 3,
      //     message: "user must have at least 3 skills",
      //   },
      //   {
      //     validator: (skills) =>
      //       !skills ||
      //       skills.every((skill) => skill.length >= 2 && skill.length <= 30),
      //     message: "each skill must be between 2 and 30 characters long",
      //   },
      // ],
    },
    summary: {
      type: String,
      default: function () {
        return `Hii ,My Name is ${this.firstName} my age is ${this.age} my skills are ${this.keySkills} and i am located in ${this.location}`;
      },
      maxlength: [200, "summary length can not be greater than 200 characters"],
    },
    location: {
      type: String,
      // required: true,
      validate: {
        validator: (location) =>
          validator.isLength(location, { min: 5, max: 50 }),
        message: "location must be between 5 and 50 characters long",
      },
      index: true,
    },
    age: {
      type: Number,
      // required: true,
      validate: {
        validator: (age) => age >= 15 && age <= 99,
        message: "age must be between 15 and 99",
      },
    },
    emailId: {
      type: String,
      required: [
        true,
        () => {
          throw new Error("Cannot send connection request to yourself!");
        },
      ],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
      maxlength: [
        50,
        "email address length can not be greater than 50 characters",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "password must be at least 8 characters long"],
      validate: [
        (password) => /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password),
        "password must contain at least one uppercase letter, one lowercase letter, and one number",
      ],
    },
    photoUrl: {
      type: String,
      default: "https://via.placeholder.com/150",
      validate: {
        validator: (url) => validator.isURL(url),
        message: "Invalid URL",
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ keySkills: 1 }); // Creates a multikey index for array field

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.generateAuthToken = async function () {
  return await jwt.sign(
    {
      id: this._id,
      email: this.emailId,
      firstName: this.firstName,
      lastName: this.lastName,
    },
    "devTinder123",
    { expiresIn: "2h" }
  );
};

userSchema.methods.validatePassword = async function (userEnteredPassword) {
  const user = this;

  const ispasswordMatched = await bcrypt.compare(
    userEnteredPassword,
    user.password
  );
  return ispasswordMatched;
};

userSchema.post("save", function (error, doc, next) {
  handleDuplicateKeyError(error, next);
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
