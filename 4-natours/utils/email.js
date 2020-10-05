const nodeMailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const dotenv = require('dotenv');
dotenv.config();

module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email), (this.firstName = user.name.split(' ')[0]);
    (this.url = url),
      (this.from = `Mikail Rasheed <${process.env.EMAIL_FROM}>`);
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // send real email with sendgrid
      return nodeMailer.createTransport({ 
        service: 'SendGrid', 
        auth: { 
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    }
    return nodeMailer.createTransport({
      // service : "Gmail",
      // host: 'smtp.mailtrap.io',
      host: process.env.EMAIL_HOST,
      // port: 2525,
      port: process.env.EMAIL_PORT,
      auth: {
        // user: 'd7e8964e2016c2',
        user: process.env.EMAIL_USERNAME,
        // pass: '853857cd1aede1',
        pass: process.env.EMAIL_PASSWORD,
      },
      // in gmail, we would need to activate "less secure app option"
    });
  }
  // send the actual email
  async send(template, subject) {
    // step 1) render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // html:
    };
    // 3) create the email transport and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours family!!');
  }
  async sendPasswordReset() {
    await this.send(
      'resetPassword',
      'Your password reset token (valid for 10 minutes only)'
    );
  }
};
