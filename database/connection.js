const mongoose = require('mongoose')
const DB_URL = process.env.MONGO_LOCAL_URI;



mongoose.connect(DB_URL).then(() => {
    console.log("database connected ");

}).catch((err) => {

    console.log("errr", err)
})

