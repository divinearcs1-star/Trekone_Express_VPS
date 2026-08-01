const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_ID,
//     pass: process.env.APP_PASS
//   }
// });
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.APP_PASS
    }
});
const sendMail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.EMAIL_ID,
        to,
        subject,
        html: htmlContent
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent:", info.messageId);
    return info;
};

module.exports = { sendMail };