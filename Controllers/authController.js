const crypto= require('crypto')
const jwt= require('jsonwebtoken')
const { promisify } = require('util')
const User= require('../Models/userModel')
const Email= require('../utils/email')
const catchAsync= require('../utils/catchAsync')
const AppError = require('../utils/appError')

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

exports.login=catchAsync(async (req, res, next)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return next(new AppError('please provide your username and password', 400))      
    }

    const user= await User.findOne({email}).select('+password');
    if (!user){
        return next(new AppError('Wrong username or password', 400))
    }

    createSendToken(user, 200, req, res)


});

exports.signUp = catchAsync(async (req, res, next)=>{
    
        const user= await User.create(req.body);
        const url= '127.0.0.1:3000/users'
        await new Email(user, url).sendWelcome()
        createSendToken(user, 201, req, res)
        
})


exports.logout = (req, res) => {
    res.cookie('secretoken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

exports.forgotPassword= catchAsync(async (req, res, next)=>{
    //-- get user based on posted email
    const user = await User.findOne({email: req.body.email})

    if(!user){
        res.status(404).json({
            message: "There is no user with this email"
        })
    }
    //-- generating random token

    const resetToken= user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});

    //--- Send Password reset link to the user's email
        const resetUrl= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        console.log(resetUrl)
        await new Email(user, resetUrl).sendPasswordReset()

        res.status(200).json({
            status: 'success',
            message: 'Token has been sent to email'
        })

});

exports.checkIfLoggedin= catchAsync(async (req, res, next)=>{
    // console.log(req.cookie)
    if(req.cookies){
            // verify if token is real
            const decoded= await promisify(jwt.verify)(
                req.cookies.secretoken,
                process.env.JWT_SECRET
            );

            // check if user still exists
            const currentUser= await User.findById(decoded.id);  

            if(!currentUser){
                return (next(new AppError('this user does not exist', 404)))
            };

            //check if user changed password after the token was issued

            if(currentUser.changedPasswordAfter(decoded.iat)){
                return (next(new AppError('password has been changed please login again', 400)))
            }

            //if all these are coditions are met then there is a logged in user, therfore store user info in locals
            res.locals.user= currentUser

            //Allow next middleware
            return next();
    }
    //Else if there are no saved cookies, user isnt logged in
    next(new AppError('user is not logged in', 400))

})

exports.resetPassword= catchAsync(async (req, res, next)=>{

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

});


// Restrict certain pages and action to users with specific roles
exports.Restrict = (...roles) => {

    return (req, res, next) => {
        // const user= User.findById(req.params)
        const role= res.locals.user.role
      // roles ['admin', 'lead-guide']. role='user'
      if (roles.includes(role)) {
        res.status(403).send({
            message: `User with your role: ${role} cannot access this page \n this page is Highly restricted`
        })
      }
  
      next();
    };
  };
