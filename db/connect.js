const mongoose = require("mongoose");

require("dotenv").config();
const db_url = process.env.DATABASE_URL;

mongoose
  .connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((error) => {
    console.log("Error : " + error);
  });

module.exports = mongoose;
