const Stripe = require("stripe");

const Secret_Key = process.env.STRIPE_SECRET_KEY_NEW;

const stripe = Stripe(Secret_Key);

const AddCustomer = async (name, email, description, phone, metaData) => {
  const customer = await stripe.customers.create({
    name: name,
    email: email,
    description: description,
    phone: phone,
    metadata: metaData,
  });
  return customer;
};

const DeleteCustomer = async (customerId) => {
  const customer = await stripe.customers.del(customerId);
  return customer;
};

const AddCard = async (
  customerID,
  number,
  expMonth,
  expYear,
  CVC,
  metaData
) => {
  const cardToken = await stripe.tokens.create({
    card: {
      number: number,
      exp_month: expMonth,
      exp_year: expYear,
      cvc: CVC,
      metadata: metaData,
    },
  });
  const addCardToCustomer = await stripe.customers.createSource(customerID, {
    source: cardToken.id,
  });
  return addCardToCustomer;
};

const GetCustomer = async (customerId) => {
  const customer = await stripe.customers.retrieve(customerId);
  return customer;
};

const GetCards = async (customerID) => {
  const cards = await stripe.customers.listSources(customerID, {
    object: "card",
  });
  return cards.data;
};

const MakeTransaction = async (
  accountID,
  customerID,
  amount,
  currency,
  description,
  receiptEmail,
  cardId,
  metaData
) => {
  //   const charge = await stripe.charges.create({
  //     amount: amount,
  //     currency: currency,
  //     customer: customerID,
  //     description: description,
  //     receipt_email: receiptEmail,
  //     source: cardId,
  //     metadata: metaData,
  //   });
  const appFee = amount * 0.18;
  console.log(Math.ceil(appFee) + "App fee " + amount);
  const charge = await stripe.paymentIntents.create({
    customer: customerID,
    amount: amount,
    source: cardId,
    confirm: true,
    receipt_email: receiptEmail,
    currency: "gbp",
    application_fee_amount: Math.ceil(appFee),
    description: description,
    transfer_data: {
      destination: accountID,
    },
  });
  console.log(charge);
  return charge;
};

const RefundTransaction = async (chargeID) => {
  const refund = await stripe.refunds.create({ charge: chargeID });
  return refund;
};

const CreateInvoice = async (
  amount,
  currency,
  customerID,
  description,
  metaData
) => {
  const product = await stripe.products.create({
    name: "Job",
    type: "service",
  });
  const price = await stripe.prices.create({
    unit_amount: amount,
    currency: currency,
    product: product.id,
  });
  await stripe.invoiceItems.create({ price: price.id, customer: customerID });
  const invoice = await stripe.invoices.create({
    customer: customerID,
    description: description,
    metadata: metaData,
    collection_method: "send_invoice",
    days_until_due: 10,
  });
  await stripe.invoices.sendInvoice(invoice.id);
  return invoice;
};

const PayInvoice = async (invoiceId) => {
  const invoice = await stripe.invoices.pay(invoiceId);
  return invoice;
};
const GetInvoice = async (invoiceId) => {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
};

module.exports = {
  AddCustomer,
  DeleteCustomer,
  GetCustomer,
  MakeTransaction,
  AddCard,
  GetCards,
  RefundTransaction,
  CreateInvoice,
  PayInvoice,
  GetInvoice,
};
