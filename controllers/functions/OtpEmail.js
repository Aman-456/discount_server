const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

exports.sendOTP = async (email, name, user, res) => {
  try {
    console.log("object" + email);
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("object" + otp);
    const now = new Date();
    const expiration_time = new Date(now.getTime() + 10 * 60000);

    user.otp = otp;
    user.expireTime = expiration_time;
    user.save(async (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ type: "failure", result: "Server Not Responding" });
      } else {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: `${process.env.EMAIL_ADDRESS}`,
            pass: `${process.env.EMAIL_PASSWORD}`,
          },
        });

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS}`,
          to: `${email}`,
          subject: "OTP: For Change Password",
          text:
            `Dear ${name}\, \n\n` +
            "OTP for Change Password is : \n\n" +
            `${otp}\n\n` +
            "This is a auto-generated email. Please do not reply to this email.\n\n",
        };

        await transporter.verify();

        //Send Email
        transporter.sendMail(mailOptions, (err, response) => {
          console.log(response);
          console.log(err);

          if (err) {
            return res
              .status(500)
              .json({ type: "failure", result: "Server Not Responding" });
          } else {
            res.status(200).json({
              type: "success",
              result: "OTP has been sent",
            });
          }
        });
      }
    });
  } catch (error) {
    console.log(error + "error");
  }
};
