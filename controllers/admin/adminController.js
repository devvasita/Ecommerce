const adminDB = require("../../model/admin/adminmodel");
const cloudinary = require("../../cloudinary/cloudinary");
const fs = require("fs");
const bcrypt = require("bcryptjs");

exports.Register = async (req, res) => {
  const { name, email, mobile, password, confirmpassword } = req.body;

  if (
    !name ||
    !email ||
    !mobile ||
    !password ||
    !confirmpassword ||
    !req.file
  ) {
    return res.status(400).json({ error: "All Fields Are required" });
  }

  try {
    const preUser = await adminDB.findOne({ email });
    const mobileverification = await adminDB.findOne({ mobile });

    if (preUser) {
      return res.status(400).json({ error: "This Admin is Already Exist" });
    }

    if (mobileverification) {
      return res.status(400).json({ error: "This Mobile is Already Exist" });
    }

    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({ error: "Password and confirm password do not match" });
    }

    // ✅ Now upload image after all checks
    const file = req.file.path;

    const upload = await cloudinary.uploader.upload(file);

    // ✅ Delete the local file after upload
    fs.unlink(file, (err) => {
      if (err) {
        console.error("Error deleting local file:", err);
      } else {
        console.log("Local file deleted successfully");
      }
    });

    const adminData = new adminDB({
      name,
      email,
      mobile,
      password,
      profile: upload.secure_url,
    });

    await adminData.save();
    res.status(200).json(adminData);
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// To login admin
/**
 *
 * 1 ) get user , password
 * 2 ) compare password
 * 3 ) send token to FE
 */
exports.Login = async (req, res) => {
  const { password, email } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: "All fields are required !!!",
    });
  }

  try {
    const adminVaild = await adminDB.findOne({
      email: email,
    });

    if (adminVaild) {
      const isMatch = await bcrypt.compare(password, adminVaild.password);

      if (!isMatch) {
        res.status(400).json({ error: "Invaild Details" });
      } else {
        const token = await adminVaild.genrateAuthToken();

        const result = {
          adminVaild,
          token,
        };

        res.status(200).json(result);
      }
    } else {
      res.status(400).json({
        error: "Invaild Details",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

// to verify admin when login
exports.AdminVerify = async (req, res) => {
  console.log("CALLEDDDD", req.userId);

  try {
    const VerifyAdmin = await adminDB.findOne({
      _id: req.userId,
    });

    console.log(VerifyAdmin, "ADMIN");

    res.status(200).json(VerifyAdmin);
  } catch (error) {
    res.status(400).json({
      error: "Invaild Details",
    });
  }
};

// to logout admin

exports.Logout = async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((currentElement) => {
      return currentElement.token !== req.token;
    });

    req.rootUser.save();
    res.status(200).json({
      message: "Admin logout Succesfully",
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
