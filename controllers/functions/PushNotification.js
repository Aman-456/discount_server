const fetch = require('node-fetch');

require('dotenv').config();
const FIREBASE_APPLICATION_API_KEY = process.env.FIREBASE_APPLICATION_API_KEY;

exports.CalculateDistance = async (data, fcmToken) => {
    let message = {
        registration_ids: [fcmToken],
        notification: {
            title: "Innua Notification",
            body: "Congrats",
            vibrate: 1,
            sound: 1,
            show_in_foreground: true,
            priority: "high",
            content_available: true,
        },
        data: data,
    }
    let response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "key=" + FIREBASE_SERVER_KEY,
        },
        body: JSON.stringify(message),
    })
    response = await response.json()
    return response;
}