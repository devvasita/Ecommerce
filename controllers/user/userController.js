const cloudinary = require("../../cloudinary/cloudinary");
const userDB = require("../../model/user/userModel");
const fs = require("fs");
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { transporter } = require("../../helper");
const path = require("path");
const usercontactDB = require("../../model/user/userContactModel");
const SECRET_KEY = process.env.USER_SECRET_KEY;

exports.userRegister = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (
    !firstName ||
    !email ||
    !lastName ||
    !password ||
    !confirmPassword ||
    !req.file
  ) {
    res.status(400).json({ error: "all fileds are required" });
  }

  const file = req.file?.path;
  const upload = await cloudinary.uploader.upload(file);

  fs.unlink(file, (err) => {
    if (err) {
      console.log("error deleting local file", err);
    } else {
      console.log("Local File deleted Sucsessfully");
    }
  });

  try {
    const preuser = await userDB.findOne({ email: email });

    if (preuser) {
      res.status(400).json({ error: "this user is already exist" });
    } else if (password !== confirmPassword) {
      res
        .status(400)
        .json({ error: "password and confirm password not match" });
    } else {
      const userData = new userDB({
        firstName,
        lastName,
        email,
        password,
        userProfile: upload.secure_url,
      });

      // here password hashing

      await userData.save();
      res.status(200).json(userData);
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, "EMAIL");

  if (!email || !password) {
    res.status(400).json({
      error: "All fields are required",
    });
  }

  try {
    const vaildUser = await userDB.findOne({ email: email });

    if (vaildUser) {
      const isMatch = await bcrypt.compare(password, vaildUser.password);

      if (!isMatch) {
        res.status(400).json({ error: "Invaild Details" });
      } else {
        // ✅ Step 1: Expired tokens hata do
        vaildUser.tokens = vaildUser.tokens.filter((tokenObj) => {
          const decoded = jwt.decode(tokenObj.token);

          return decoded.exp * 1000 > Date.now(); // token abhi valid hai
        });

        // also this will remove more than 5 logins
        if (vaildUser.tokens.length >= 5) {
          vaildUser.tokens.shift(); // max 5 token rakhna
        }

        const token = await vaildUser.genrateUserAuthToken();

        const result = {
          user: vaildUser,
          token,
        };

        res.status(200).json(result);
      }
    } else {
      res.status(400).json({ error: "Invaild User details" });
    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

// to verify user is loggedin or not

exports.userVerify = async (req, res) => {
  try {
    const verifyUser = await userDB.findOne({
      _id: req.userId,
    });

    res.status(200).json(verifyUser);
  } catch (error) {
    res.status(400).json(error);
  }
};

// logout
exports.userLogout = async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((currentElement) => {
      return currentElement.token !== req.token;
    });

    req.rootUser.save();
    res.status(200).json({ message: "user Succesfully Logout" });
  } catch (error) {
    res.status(400).json(error);
  }
};

// for forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Enter Your Email" });
  }

  try {
    const userFind = await userDB.findOne({ email });

    if (!userFind) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign({ _id: userFind._id }, SECRET_KEY, {
      expiresIn: "120s",
    });

    const setUserToken = await userDB.findByIdAndUpdate(
      userFind._id,
      { verifyToken: token },
      { new: true }
    );

    //   join email path
    const emailTemplatePath = path.join(
      __dirname,
      "../../EmailTemplate/ForgotTemplate.ejs"
    );

    // to read file
    const emailTemplateRead = fs.readFileSync(emailTemplatePath, "utf-8");

    //  data to send template for link
    const dataForTemplate = {
      passwordresetlink: `http://localhost:5000/resetpassword/${userFind.id}/${setUserToken.verifyToken}`,
      logo: "https://cdn-icons-png.flaticon.com/128/732/732200.png",
    };

    //   to render dynamic value in ejs
    const renderTemplate = ejs.render(emailTemplateRead, dataForTemplate);

    if (!setUserToken) {
      return res.status(400).json({ error: "Failed to set user token" });
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Sending Email For password Reset",
      html: renderTemplate,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log("error mail", error);
        return res.status(500).json({ error: "Failed to send email" });
      } else {
        // console.log("Email Sent", info.response);
        return res.status(200).json({ message: "Email sent successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// forgot password verify
exports.forgotPasswordVerify = async (req, res) => {
  const { id, token } = req.params;

  try {
    const vaildUser = await userDB.findOne({
      _id: id,
      verifyToken: token,
    });

    const verifyToken = jwt.verify(token, SECRET_KEY);

    if (vaildUser && verifyToken._id) {
      res.status(200).json({ message: "Vaild User" });
    } else {
      res.status(400).json({
        error: "User does not exist",
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

// to reset Password
exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const vaildUser = await userDB.findOne({
      _id: id,
      verifyToken: token,
    });

    const verifyToken = jwt.verify(token, SECRET_KEY);

    if (vaildUser && verifyToken._id) {
      const newPassword = await bcrypt.hash(password, 12);

      await userDB.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          password: newPassword,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        message: "Password Sucessfully updated.",
      });
    } else {
      res.status(400).json({
        error: "Session Timeout !!! , Please genrate new Link.",
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

//  IF have id already present in jwt then why have to take from params ???
// exports.resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY); // decode and verify
//     const userId = decoded._id;

//     const user = await userDB.findById(userId);
//     if (!user) {
//       return res.status(400).json({ error: "Invalid user." });
//     }

//     const newPassword = await bcrypt.hash(password, 12);
//     await userDB.findByIdAndUpdate(userId, { password: newPassword });

//     res.status(200).json({ message: "Password successfully updated." });
//   } catch (error) {
//     res.status(400).json({ error: "Invalid or expired token." });
//   }
// };

// to get all users by using pagination
exports.getallUsers = async (req, res) => {
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 5;

  try {
    const skip = (page - 1) * ITEM_PER_PAGE;

    const count = await userDB.countDocuments();

    const pageCounts = Math.ceil(count / ITEM_PER_PAGE);

    const userData = await userDB
      .find()
      .select("-verifyToken -password -tokens")
      .limit(ITEM_PER_PAGE)
      .skip(skip)
      .sort({ _id: -1 })
      .lean();

    res.status(200).json({
      pagination: {
        count,
        pageCounts,
      },
      usersdata: userData,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

// to delete user
exports.userDelete = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteUser = await userDB
      .findByIdAndDelete({
        _id: id,
      })
      .select("-password -tokens ");

    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
};

// to add user contact details

exports.userContact = async () => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({
      error: "All fields are required",
    });
  }

  try {
    const userMessageData = new usercontactDB({
      name,
      email,
      message,
    });

    await userMessageData.save();
    res.status(200).json(userMessageData);
  } catch (error) {
    res.status(400).json(error);
  }
};
