require("dotenv").config();
const nodemailer = require("nodemailer");

exports.AdminEmail = async (vendor, type) => {
  console.log("vendors ");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: `${process.env.EMAIL_ADDRESS}`,
      pass: `${process.env.APP_PASS}`,
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_ADDRESS}`,
    to: `${process.env.EMAIL_ADDRESS_ADMIN}`,
    subject: `${type} Approval Request From Vendor`,
    text:
      `Dear Admin , \n\n` +
      `You have new vendor approval request from ${vendor.name} : \n\n` +
      "This is a auto-generated email. Please do not reply to this email.\n\n",
  };

  await transporter.verify();

  //Send Email
  return transporter.sendMail(mailOptions, (err, response) => {
    console.log(response);

    if (err) {
      return false;
    } else {
      return true;
    }
  });
};
