const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.USER_SECRET_KEY;

const userController = require("../../controllers/user/userController");
const userUpload = require("../../multerconfig/user/userStorageConfig");
const userAuthenticate = require("../../middleware/user/userAuthenticate");
const adminAuthenticate = require("../../middleware/admin/adminAuthenticate");

// to register user
router.post(
  "/register",
  userUpload.single("user_Profile"),
  userController.userRegister
);

// to Login user
router.post("/login", userController.userLogin);

// to veryfy logged in user
router.get("/userLoggedIn", userAuthenticate, userController.userVerify);

// to logout user
router.get("/logout", userAuthenticate, userController.userLogout);

// To send restPassword link
router.post("/forgotPassword", userController.forgotPassword);

// to verify route of forgotpassword
router.get("/forgotPassword/:id/:token", userController.forgotPasswordVerify);

// to reset Password
router.put("/resetpassword/:id/:token", userController.resetPassword);

// to get all users
router.get("/getAllUsers", adminAuthenticate, userController.getallUsers);

// to delete user , admin can delete
router.delete("/userdelete/:id", adminAuthenticate, userController.userDelete);

// to get usercontact details
router.post("/usercontact", userAuthenticate, userController.userContact);

module.exports = router;

// forgot password
