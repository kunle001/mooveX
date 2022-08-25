const crypto= require('crypto')
const jwt= require('jsonwebtoken')
const { promisify } = require('util')
const User= require('../Models/userModel')
const Email= require('../utils/email')

const signToken= id=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken= (user, statusCode, req, res)=>{
    const token= signToken(user._id);

    res.cookie('secretoken', token, {
        httpOnly: true,
        secure: req.secure
    })

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    });
};

exports.login=async (req, res, next)=>{
    const {email, password} = req.body;
    console.log(email, password)

    if(!email || !password){
        res.status(404).json({
            message: "provide email and password"
        })
    }

    const user= await User.findOne({email}).select('+password');
    console.log(user)
    if (!user){
        res.status(401).json({
            message: 'Incorrect Username or password'
        })
    }

    createSendToken(user, 200, req, res)


}

exports.logout=async (req, res, next)=>{
    res.cookie('secretoken', 'loggedout', {
        expires: new Date(Date.now() + 1*1000), 
        httpOnly: true
    });

    res.status(200).json({ status: 'success', message: 'Logged out!'});

};

exports.forgotPassword= async (req, res, next)=>{

    //-- get user based on posted email
    const user = await User.findOne({email: req.body.email})

    if(!user){
        res.status(404).json({
            message: "There is no user with thsi email"
        })
    }
    //-- generating random token

    const resetToken= user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});

    //--- Send it to the user's email
    try{
        const resetUrl= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        console.log(resetUrl)
        await new Email(user, resetUrl).sendPasswordReset()

        res.status(200).json({
            status: 'success',
            message: 'Token has been sent to email'
        })
    }catch(err){
            user.passwordResetToken= undefined;
            user.passwordResetExpires= undefined;
            await user.save({ validateBeforeSave: false});

            res.status(404).json({
                message:"There was an Error Sending the email"
            })
        {
    }
}

}

exports.checkIfLoggedin= async (req, res, next)=>{
    // console.log(req.cookie)
    if(req.cookies){
        try{
            // verify if token is real
            const decoded= await promisify(jwt.verify)(
                req.cookies.secretoken,
                process.env.JWT_SECRET
            );

            // check if user still exists
            const currentUser= await User.findById(decoded.id);

            if(!currentUser){
                res.status(400).json({
                    message: 'this user doesnot exist'
                });
            };

            //check if user changed password after the token was issued

            if(currentUser.changedPasswordAfter(decoded.iat)){
                res.status(404).json({
                    message: 'password has been changed, please login again'
                })
            }

            //if all these are coditions are met then there is a logged in user

            res.locals.user= currentUser
            return next();

        }catch(err){
            res.status(400).json({
                message: err.message
            })
        }
    }
    res.status(400).json({
        message: "user is not logged in"
    })
}

exports.resetPassword= async (req, res, next)=>{

    const hashedToken= crypto.createHash('sha256').update(req.params.token).digest('hex')


    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
    console.log(user)

    if(!user){
        res.status(404).json({
            message: "Token has expired or wrong token"
        })
    }

    user.passwordResetExpires= undefined;
    user.passwordResetToken= undefined;
    user.password= req.body.password;
    user.passwordConfirm= req.body.passwordConfirm;
    user.passwordChangedAt= Date.now()
    await user.save();

    new Email(user,'127.0.0.1:3000').sendPasswordChanged()

    createSendToken(user, 200, req, res)

};

exports.Restrict = (...roles) => {

    return (req, res, next) => {
        // const user= User.findById(req.params)
        const role= res.locals.user.role
        // console.log(res.locals.user.role)
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(role)) {
        res.status(403).send({
            message: `You are a/an ${role} this page is Highly restricted`
        })
      }
  
      next();
    };
  };
