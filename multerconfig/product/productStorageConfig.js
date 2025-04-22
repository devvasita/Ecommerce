const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./productUploads");
  },

  filename: (req, file, callback) => {
    const fileName = `image-${Date.now()}.${file.originalname}`;
    callback(null, fileName);
  },
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only jpeg,jpg and png file types are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
