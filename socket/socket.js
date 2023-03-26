const SocketDB = require("./dbFunctions/SocketDB");
const users = new Map();

module.exports = function (io) {
  io.on("connection", (socket) => {
    // console.log("A User Connected !");
    const socketId = socket.id;
    const userId = socket.handshake.query.id;
    users.set(userId, socketId);
    // console.log("On Connection", users);
    socket.on("checkout", async (data) => {
      const response = await SocketDB.onSendRequestFromCustomer(data);
      if (response.type) {
        io.to(users.get(data.customerId)).emit("requestResponse", {
          type: true,
          msg: "Payment Details Saved Successfully.",
          orderId: response.data.order._id,
        });
        io.to(users.get(data.vendorId)).emit("orderRequest", response);
      } else {
        io.to(users.get(data.customerId)).emit("requestResponse", response);
      }
    });
    socket.on("riderassign", async (data) => {
      console.log(data);
      const response = await SocketDB.riderAssignSocker(data);
      // if (response.type) {
      io.to(users.get(data.customerId)).emit("orderassigned", response);
      io.to(users.get(data.vendorId)).emit("orderassigned", response);
      io.to(users.get(`${response?.rider}`)).emit("orderassigned", response);
      // } else {
      //   io.to(users.get(data.customerId)).emit("requestResponse", response);
      // }
    });
    socket.on("rideraccept", async (data) => {
      console.log(data);
      const response = await SocketDB.riderAccept(data);
      // if (response.type) {

      io.to(users.get(data.vendorId)).emit("orderaccepted", response);
      // io.to(users.get(data.vendorId)).emit("orderRequest", response);
      // } else {
      //   io.to(users.get(data.customerId)).emit("requestResponse", response);
      // }
    });
    socket.on("riderreject", async (data) => {
      console.log(data);
      const response = await SocketDB.riderReject(data);
      // if (response.type) {

      io.to(users.get(data.vendorId)).emit("orderejected", response);
    });

    // On Disconnect Remove Socket
    socket.on("disconnect", async (data) => {
      const socketId = socket.id;
      await removeUser(socketId);
      // console.log("On Disconnection", users);
    });
  });
};

const removeUser = async (socketID) => {
  users.forEach(function (value, key) {
    if (value === socketID) {
      users.delete(key);
    }
  });
};
