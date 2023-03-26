const Stripe = require("./../../externals/stripe");

exports.updateApplications = async (applications) => {
    const updatedApplications = [];
    for (i = 0; i < applications.length; i++) {
        const invoiceDetails = await Stripe.GetInvoice(applications[i].invoice.id);
        let newObject = {};
        if (invoiceDetails.status === "paid") {
            newObject = { ...applications[i], status: "Paid" };
        } else {
            newObject = { ...applications[i], status: "Accepted" };
        }
        updatedApplications.push(newObject)
        return updatedApplications;
    }
}