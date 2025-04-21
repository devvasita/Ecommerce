const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.USER_SECRET_KEY;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please Enter vaild Email");
        }
      },
    },
    userProfile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],

    // Verify Token for forgot password will only vaild for 120s
    verifyToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.genrateUserAuthToken = async function () {
  try {
    let newToken = jwt.sign(
      {
        _id: this._id,
      },
      SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    this.tokens = this.tokens.concat({ token: newToken });

    await this.save();
    return newToken;
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

const userDB = new mongoose.model("users", userSchema);

module.exports = userDB;
