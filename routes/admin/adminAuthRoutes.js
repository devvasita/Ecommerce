const express = require("express");
const router = new express.Router();

const adminAuthcontroller = require("../../controllers/admin/adminController");
const adminUpload = require("../../multerconfig/admin/adminStorageConfig");
const adminAuthenticate = require("../../middleware/admin/adminAuthenticate");

// admin auth routes
router.post(
  "/register",
  adminUpload.single("admin_profile"),
  adminAuthcontroller.Register
);

// login route

router.post("/login", adminAuthcontroller.Login);

// to verify admin

router.get("/adminverify", adminAuthenticate, adminAuthcontroller.AdminVerify);

router.get("/logout", adminAuthenticate, adminAuthcontroller.Logout);

module.exports = router;
