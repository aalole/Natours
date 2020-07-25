const nodeMailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodeMailer.createTransport({
    // service : "Gmail",
    // host: 'smtp.mailtrap.io',
    host: process.env.EMAIL_HOST,
    // port: 2525,
    port: process.env.EMAIL_PORT,
    auth: {
      // user: 'd7e8964e2016c2',
      user: process.env.EMAIL_USERNAME,
      // pass: '853857cd1aede1',
      pass : process.env.EMAIL_PASSWORD
    },
    // in gmail, we would need to activate "less secure app option"
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Rasheed Mikail <abiodunrasheed93@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
