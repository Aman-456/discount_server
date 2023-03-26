const jwt = require("jsonwebtoken");

require("dotenv").config();
const jwtSecretKey = process.env.JWT_SECRET_KEY;

exports.athenticate = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, jwtSecretKey, (err, data) => {
      if (err) {
        res
          .status(401)
          .json({ type: "failure", result: "You Are Not Logged in" });
      } else {
        next();
      }
    });
  } else {
    res
      .status(401)
      .json({ type: "failure", result: "You are not Logged in. Signin Again" });
  }
};
