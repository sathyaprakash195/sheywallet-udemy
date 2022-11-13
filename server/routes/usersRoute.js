const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

// register user account

router.post("/register", async (req, res) => {
  try {
    // check if user already exists

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.send({
        success: false,
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    const newUser = new User(req.body);
    await newUser.save();
    res.send({
      message: "User created successfully",
      data: null,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// login user account

router.post("/login", async (req, res) => {
  try {
    // check if user exists
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User does not exist",
      });
    }

    // check if password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.send({
        success: false,
        message: "Invalid password",
      });
    }

    // check if user is verified
    if (!user.isVerified) {
      return res.send({
        success: false,
        message: "User is not verified yet or has been suspended",
      });
    }

    // generate token
    const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, {
      expiresIn: "1d",
    });
    res.send({
      message: "User logged in successfully",
      data: token,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// get user info

router.post("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    user.password = "";
    res.send({
      message: "User info fetched successfully",
      data: user,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// get all users

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.send({
      message: "Users fetched successfully",
      data: users,
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// update user verified status

router.post("/update-user-verified-status", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.body.selectedUser, {
      isVerified: req.body.isVerified,
    });
    res.send({
      data: null,
      message: "User verified status updated successfully",
      success: true,
    });
  } catch (error) {
    res.send({
      data: error,
      message: error.message,
      success: false,
    });
  }
});
module.exports = router;
