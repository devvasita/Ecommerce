const nodemailer = require("nodemailer");
const cloudinary = require("./cloudinary/cloudinary");
const fs = require("fs");

// exports.transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   auth: {
//     user: "garry.prosacco@ethereal.email",
//     pass: "8x9ebWNEsZcfbUfBbn",
//   },
// });

exports.transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.uploadToCloudinary = async (localFilePath) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath);

    // Delete local file after upload
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error("❌ Error deleting local file:", err);
      } else {
        console.log("✅ Local file deleted successfully");
      }
    });

    return result; // Contains public_id, secure_url, etc.
  } catch (error) {
    // Even if upload fails, clean up local file
    fs.unlink(localFilePath, () => {});
    throw error;
  }
};
