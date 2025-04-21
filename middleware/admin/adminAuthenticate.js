const adminDB = require("../../model/admin/adminmodel");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.ADMIN_SECRET_KEY;

const adminauthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    const verifyToken = jwt.verify(token, SECRET_KEY);

    const rootUser = await adminDB.findOne({
      _id: verifyToken._id,
    });

    console.log(rootUser, "ROOTUSER");

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    next();
  } catch (error) {
    res.status(400).json({
      error: "Unauthorized No token Provided",
    });
  }
};

module.exports = adminauthenticate;
