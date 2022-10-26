const nodemailer= require('nodemailer')
const htmlToText= require('html-to-text')
const pug= require('pug')
const Sib = require('sib-api-v3-sdk')

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = "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"

const tranEmailApi = new Sib.TransactionalEmailsApi()

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName= user.firstName;
        this.url = url;
        this.from = `Oluwole Olanipekun <${process.env.EMAIL_FROM}>`; 
    }

    newTransport(subject,html){
        if (process.env.NODE_ENV === 'development'){
            const sender = {
                email: 'adekunle.olanipekun@gmail.com',
                name: 'Adekunle',
            }
            
            const receivers = [
                {
                    email: this.to,
                    name: this.firstName
                },
            ]
            return (                
                tranEmailApi
                    .sendTransacEmail({
                        sender,
                        to: receivers,
                        subject: "Hello User",
                        htmlContent: html,
                        // textContent: htmlToText.fromString(html)
                    })

            )
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject){
        //Define email options
        //1) Render Html based on pug template
        const html= pug.renderFile(`${__dirname}\\..\\views\\emails\\${template}.pug`, {
            firstName: this.firstName, 
            url: this.url, 
            subject
        })
        const mailOptions= {
            form: this.from,
            to:this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        //2) create transport 
        if (process.env.NODE_ENV==='development'){
             await this.newTransport(subject, html)
            }
        else{

            await this.newTransport().sendMail(mailOptions);
        }
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to mooveX lets help you find your dream apartment')
    }

    async sendPasswordReset(){
        await this.send(
            `follow this link to change password \n ${this.url} \n Your password reset token is valid for only 10 minutes \n
            if you did not request to change password ignore this`
        )
    }

    async sendPasswordChanged(){
        await this.send('Your Password has been changed sucessfully')

    }

    async sendActivate(){
        await this.send('Your Account has been Activated')
    }

}