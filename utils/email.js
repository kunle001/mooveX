const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')
const pug = require('pug')


module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.name = user.firstName;
        this.url = url;
        this.from = `mooveX <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        console.log(!process.env.NODE_ENV)
        if (process.env.NODE_ENV === 'production') {
            console.log('...setting up mail')
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_APIKEY
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject, message) {
        //Define email options
        //1) Render Html based on pug template
        const html = pug.renderFile(`${__dirname}\\..\\views\\emails\\${template}.pug`, {
            name: this.name,
            url: this.url,
            message,
            subject
        })
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        //2) create transport 
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to mooveX')
    }

    async sendPasswordReset() {
        await this.send('passwordReset',
            `click the button below, Your password reset token is valid for only 10 minutes \n
            if you did not request to change password ignore this`
        )
    }

    async sendPasswordChanged() {
        await this.send('passwordChanged', 'Your Password has been changed sucessfully')

    };

}