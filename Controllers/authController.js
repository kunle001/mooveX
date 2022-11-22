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
};

const createSendToken= (user, statusCode, req, res)=>{
    const token= signToken(user._id);

    res.cookie('secretoken', token, {
        expires: new Date(
            Date.now() + 2*2*60*60*1000
        ),
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
    if (!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Wrong username or password', 400))
    }

    createSendToken(user, 200, req, res)

}); 

exports.signUp = catchAsync(async (req, res, next)=>{
        
        const user= await User.create(req.body);
        const url= `${req.protocol}://${req.get('host')}/my-profile`
        await new Email(user, url).sendWelcome()
        createSendToken(user, 201, req, res)
        
});

exports.signUpAgent= catchAsync(async(req, res, next)=>{
    const agent= await Agent.create(req.body);

    createSendToken(agent, 201, req, res)
})


exports.logout = (req, res) => {
    res.cookie('secretoken', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }  

    // 3) Send it to user's email
    if (user){
        
        try {
            // 2) Generate the random reset token
            const resetToken = user.createPasswordResetToken();
            await user.save({ validateBeforeSave: false });

            /////
            const resetURL = `${req.protocol}://${req.get(
              'host'
            )}/api/v1/users/resetPassword/${resetToken}`;
            await new Email(user, resetURL).sendPasswordReset();
        
            res.status(200).json({
              status: 'success',
              message: 'Token sent to email!'
            });
          } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            console.log(err)
        
            return next(
              new AppError('There was an error sending the email. Try again later!'),
              400
            );
          }

    }
            return next(
              new AppError('There was an error sending the email. Try again later!'),
              400
            );

});


exports.protect= catchAsync(async (req, res, next)=>{
    if(req.cookies){
            // verify if token is real
            const decoded= await promisify(jwt.verify)(
                req.cookies.secretoken,
                process.env.JWT_SECRET
            );

            // check if user still exists
            const currentUser= await User.findById(decoded.id);  

            if(!currentUser){
                return (next(new AppError('Login again', 404)))
            };

            //check if user changed password after the token was issued

            if(currentUser.changedPasswordAfter(decoded.iat)){
                return (next(new AppError('password has been changed please login again', 400)))
            }

            //if all these are coditions are met then there is a logged in user, therfore store user info in locals
            req.user= currentUser
            res.locals.user= currentUser


            //Allow next middleware
            return next();
    }
    //Else if there are no saved cookies, user isnt logged in
    next(new AppError('user is not logged in', 400))

});


exports.checkIfLoggedIn= async (req, res, next)=>{
    
    if(req.cookies.secretoken){
        try{
                //VERIFY the token
            const decoded= await promisify(jwt.verify)(
                req.cookies.secretoken,
                process.env.JWT_SECRET
            );
            //Check is user still exists
            
            const currentUser= await User.findById(decoded.id);

            
            if(!currentUser){
                return next();
            };
    
            // check if user changed password after logging in 
            if(currentUser.changedPasswordAfter(decoded.iat)){
                return next();
            };
            req.user = currentUser;
            res.locals.user= currentUser;
            return next()                                
        }catch(err){
            return next();
        }
    };
    next();
};

exports.resetPassword= catchAsync(async (req, res, next)=>{

    const hashedToken= crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });


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

    new Email(user,`${req.protocol}/${req.get('host')}`).sendPasswordChanged()

    createSendToken(user, 200, req, res)

});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
  
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  
    // 3) If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!
  
    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  });


// Restrict certain pages and action to users with specific roles
exports.RestrictTo = (...roles) => {

    return (req, res, next) => {
        // const user= User.findById(req.params)
        const role= res.locals.user.role
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(role)) {
        res.status(403).send({
            message: `User with your role: ${role} cannot access this page \n this page is Highly restricted`
        })
      }
  
      next();
    };
  };
  


