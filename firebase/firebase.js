const fetch = require("node-fetch");
require("dotenv").config();

exports.Notify = async (title, subTitle, fcmToken) => {
  const message = {
    registration_ids: [fcmToken],
    notification: {
      title: title,
      body: subTitle,
      icon: "assets/innuaa.png",
      android_channel_id: "sound_vendor",
      vibrate: 1,
      sound: 1,
      show_in_foreground: true,
      priority: "high",
      content_available: true,
    },
    data: {
      title: "Innua Notification",
      body: "Congrats",
    },
  };
  let response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "key=AAAA4LVRRpY:APA91bGAyDU2VyV6q4JU2Jnd8GJD2qM6ObD3rgs_aPkeWuGLsU1tIo8TM6RifCtsmtFtrEG-jpTUXBgBVBZnaVQooKVYDL6S7SQhLVvooP8BhrgAvn4vXEIwV-Z2wOn0GgiH45QNSjOv",
    },
    body: JSON.stringify(message),
  });
  response = await response.json();
  // console.log(response);
  return response;
};
exports.NotifyCustomerChat = async (
  title,
  subTitle,
  fcmToken,
  data,
  order,
  vendor
) => {
  const message = {
    registration_ids: [fcmToken],
    notification: {
      title: title,
      body: subTitle,
      icon: "assets/innuaa.png",
      android_channel_id: "sound_vendor",
      vibrate: 1,
      sound: 1,
      show_in_foreground: true,
      priority: "high",
      content_available: true,
    },
    data: {
      title: "Innua Notification",
      body: "Congrats",
      action: "chat",
      data: data,
      order: order,
      vendor: vendor,
    },
  };
  let response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "key=AAAA4LVRRpY:APA91bGAyDU2VyV6q4JU2Jnd8GJD2qM6ObD3rgs_aPkeWuGLsU1tIo8TM6RifCtsmtFtrEG-jpTUXBgBVBZnaVQooKVYDL6S7SQhLVvooP8BhrgAvn4vXEIwV-Z2wOn0GgiH45QNSjOv",
    },
    body: JSON.stringify(message),
  });
  response = await response.json();
  // console.log(response);
  return response;
};
exports.NotifyVendorChat = async (title, subTitle, fcmToken) => {
  const message = {
    registration_ids: [fcmToken],
    notification: {
      title: title,
      body: subTitle,
      icon: "assets/innuaa.png",
      android_channel_id: "sound_vendor",
      vibrate: 1,
      sound: 1,
      show_in_foreground: true,
      priority: "high",
      content_available: true,
    },
    data: {
      title: "Innua Notification",
      body: "Congrats",
      action: "chat",
    },
  };
  let response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "key=AAAA4LVRRpY:APA91bGAyDU2VyV6q4JU2Jnd8GJD2qM6ObD3rgs_aPkeWuGLsU1tIo8TM6RifCtsmtFtrEG-jpTUXBgBVBZnaVQooKVYDL6S7SQhLVvooP8BhrgAvn4vXEIwV-Z2wOn0GgiH45QNSjOv",
    },
    body: JSON.stringify(message),
  });
  response = await response.json();
  // console.log(response);
  return response;
};
exports.VendorNotify = async (title, subTitle, fcmToken) => {
  const message = {
    registration_ids: [fcmToken],
    notification: {
      title: title,
      body: subTitle,
      type: "vendor",
      // sound: "orderalarm",
      android_channel_id: "sound_vendor_",
      icon: "assets/innuaa.png",
      vibrate: 1,
      show_in_foreground: true,
      priority: "high",
      content_available: true,
    },
    data: {
      title: "Innua Notification",
      body: "Congrats",
    },
  };
  let response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "key=AAAA4LVRRpY:APA91bGAyDU2VyV6q4JU2Jnd8GJD2qM6ObD3rgs_aPkeWuGLsU1tIo8TM6RifCtsmtFtrEG-jpTUXBgBVBZnaVQooKVYDL6S7SQhLVvooP8BhrgAvn4vXEIwV-Z2wOn0GgiH45QNSjOv",
    },
    body: JSON.stringify(message),
  });
  response = await response.json();
  // console.log(response);
  return response;
};
exports.NotifyDeliver = async (title, subTitle, fcmToken, item) => {
  const message = {
    registration_ids: [fcmToken],
    notification: {
      title: title,
      body: subTitle,
      vibrate: 1,
      android_channel_id: "sound_vendor",
      sound: 1,
      show_in_foreground: true,
      priority: "high",
      content_available: true,
    },
    data: {
      title: "Innua Notification",
      body: "Congrats",
      action: "review",
      order: item,
    },
  };
  let response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "key=AAAA4LVRRpY:APA91bGAyDU2VyV6q4JU2Jnd8GJD2qM6ObD3rgs_aPkeWuGLsU1tIo8TM6RifCtsmtFtrEG-jpTUXBgBVBZnaVQooKVYDL6S7SQhLVvooP8BhrgAvn4vXEIwV-Z2wOn0GgiH45QNSjOv",
    },
    body: JSON.stringify(message),
  });
  response = await response.json();
  // console.log(response);
  return response;
};
exports.NotifyTest = async (title, subTitle, fcmToken, item) => {
  const message = {
    registration_ids: [fcmToken],
    notification: {
      title: title,
      body: subTitle,
      android_channel_id: "sound_vendor",
      icon: "http://77.68.127.235:5000/assets/inua.png",
      image: "http://77.68.127.235:5000/assets/inua.png",

      vibrate: 1,
      sound: "http://77.68.127.235:5000/assets/orderAlarm.mp3",
      show_in_foreground: true,
      priority: "high",
      content_available: true,
    },
    data: {
      title: "Innua Notification",
      body: "Congrats",
      action: "review",
      order: item,
    },
  };
  let response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "key=AAAA4LVRRpY:APA91bGAyDU2VyV6q4JU2Jnd8GJD2qM6ObD3rgs_aPkeWuGLsU1tIo8TM6RifCtsmtFtrEG-jpTUXBgBVBZnaVQooKVYDL6S7SQhLVvooP8BhrgAvn4vXEIwV-Z2wOn0GgiH45QNSjOv",
    },
    body: JSON.stringify(message),
  });
  response = await response.json();
  // console.log(response);
  return response;
};
