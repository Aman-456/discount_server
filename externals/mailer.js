const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const config = require("config");

const clientID = config.get("google.clientID");
const clientSecret = config.get("google.clientSecret");
const redirectURI = config.get("google.redirectURI");
const refreshToken = config.get("google.refreshToken");
const service = config.get("google.emailService");
const user = config.get("google.email");

const oAuth2Client = new google.auth.OAuth2(clientID, clientSecret, redirectURI);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

exports.sendEmail = async (email, subject, template) => {
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
        service: service,
        auth: {
            type: "OAuth2",
            user: user,
            clientId: clientID,
            clientSecret: clientSecret,
            refreshToken: refreshToken,
            accessToken: accessToken
        }
    });
    const mailOptions = {
        from: user,
        to: email,
        subject: subject,
        text: "Hello from Inuaeats",
        html: template
    }
    transporter.sendMail(mailOptions).then(
        (response) => {
            return response.accepted.includes(email);
        },
        (error) => {
            return error
        }
    );
}