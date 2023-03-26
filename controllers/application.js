const Application = require("../models/application");
const Stripe = require("./../externals/stripe");
const Functions = require("./functions/updateApplications");
const nodemailer = require("nodemailer");

exports.AddApplication = async (req, res) => {
  try {
    const apply = await Application.findOne({
      job: req.body.job,
      vendor: req.body.vendor,
    });
    if (!apply) {
      const application = new Application({
        ...req.body,
        status: "Pending",
        invoice: "",
      });
      const response = await application.save();
      if (response) {
        res
          .status(200)
          .json({ type: "success", result: "Applied Successfully" });
      } else {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
      }
    } else {
      res
        .status(200)
        .json({ type: "fail", result: "Application Already Submitted" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("vendor", "name")
      .populate("job");
    res.status(200).json({ type: "success", result: applications });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetApplicationsByVendor = async (req, res) => {
  try {
    const applications = await Application.find({ vendor: req.query.vendorId })
      .populate("job")
      .lean();
    // const updatedApplications = await Functions.updateApplications(applications);
    res.status(200).json({ type: "success", result: applications });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.SendInvoice = async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.body.application },
      { $set: { status: req.body.status } }
    )
      .populate("vendor")
      .populate("job");

    //Comment on get applications status
    // const customer = await Stripe.AddCustomer(
    //   application.vendor.name,
    //   application.vendor.email,
    //   application.job.address,
    //   application.vendor.phone
    // );
    // const invoice = await Stripe.CreateInvoice(
    //   100,
    //   "usd",
    //   customer.id,
    //   application.vendor.name
    // );
    // const invoiceDetails = await Stripe.GetInvoice(invoice.id);
    // await Application.updateOne(
    //   { _id: application._id },
    //   { $set: { invoice: invoiceDetails } }
    // );
    const applications = await Application.find({
      vendor: application.vendor._id,
    })
      .populate("vendor")
      .populate("job");

    sendEmail(
      req.body.status,
      application.vendor.email,
      application.name,
      applications,
      res
    );
  } catch (error) {
    res.status(500).json({ type: "failure", result: error });
  }
};
async function sendEmail(status, email, name, applications, res) {
  try {
    console.log(
      "object" + email + process.env.EMAIL_ADDRESS + process.env.EMAIL_PASSWORD
    );
    const transporter = await nodemailer.createTransport({
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
      to: email,
      subject: `Job Application ${status}`,

      text: `Dear ${name} Your job application has been ${status} ,Please check your portal for the status`,
    };

    await transporter.verify();

    //Send Email
    await transporter.sendMail(mailOptions, (err, response) => {
      console.log(response);
      if (err) {
        res
          .status(500)
          .json({ type: "failure", result: "Server Not Responding" });
        return;
      } else {
        res.status(200).json({ type: "success", result: applications });
      }
    });
  } catch (error) {
    console.log(error + "error");
  }
}
