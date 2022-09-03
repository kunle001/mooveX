const nodemailer= require('nodemailer')

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName= user.firstName;
        this.url = url;
        this.from = `Oluwole Olanipekun <${process.env.EMAIL_FROM}>`; 
    }

    newTransport(){
        if (process.env.NODE === 'production'){

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

    async send(subject){
        //Define email options

        const mailOptions= {
            form: this.from,
            to:this.to,
            subject
        };
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('Welcome to mooveX lets help you find your dream apartment')
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