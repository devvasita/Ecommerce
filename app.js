require("dotenv").config();
const express = require("express");
const app = express();
require("./database/connection");

const cors = require("cors");

const PORT = process.env.PORT;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// admin Routes
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
app.use("/adminauth/api", adminAuthRoutes);

// product routes
const productRoutes = require("./routes/product/productRoutes");
app.use("/product/api", productRoutes);

// user routes
const userAuthRoutes = require("./routes/user/userRoutes");
app.use("/userauth/api", userAuthRoutes);

app.listen(PORT, () => {
  console.log("Server Started on port", PORT);
});
