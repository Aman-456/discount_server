const mongoose = require("mongoose");

require("dotenv").config();
// const db_url = process.env.MONGO_DB;
const db_url = process.env.DATABASE_URL;
// const db_url = process.env.DATABASE_URL_PROD;

mongoose.connect(
  db_url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (error) => {
    if (!error) {
      console.log("Database Connected Successfully");
    } else {
      console.log("Error : " + error);
    }
  }
);

module.exports = mongoose;
