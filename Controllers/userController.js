const User= require('../Models/userModel')
const sharp = require('sharp')
const APIFeatures= require('../utils/apiFeatures')
const Email= require('../utils/email')
const catchAsync= require('../utils/catchAsync')
const multer= require('multer')
const AppError = require('../utils/appError')


const multerStorage= multer.memoryStorage();

// Filtering files that are not images 
const multerFilter= (req, file, cb)=>{
    if (file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image! PLease upload only images', 400), false)
    }
}


const upload= multer({
    storage: multerStorage,
    fileFilter: multerFilter

});

exports.resizeUserPhoto=(req, res, next)=>{
    if(!req.file) return next();
    if(req.params.id){
        req.file.filename= `user-${req.params.id}-${Date.now()}.jpeg`
    }
    req.file.filename= `user-${res.locals.user._id}-${Date.now()}.jpeg`
    sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/images/users/${req.file.filename}`);
    next();
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};


exports.uploadUserPhoto= upload.single('imageCover');


exports.getAllUsers= catchAsync(async(req, res, next)=>{

        let filter= {}
        const features = new APIFeatures(User.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()

        const users= await features.query

        res.status(200).json({
            message: 'success',
            length: users.length,
            data: users
        })

});



exports.getOneUser= catchAsync(async (req, res, next)=>{
        const user= await User.findById(req.params.id)

        if(!user){
            return (next(new AppError('no user with this id', 404)))
        }
        
        if(user.role==='user'){
            user.populate('agent');
        }else if(user.role === 'agent'){
            user.populate('user');
        };
        
        res.status(200).json({
            message: 'success',
            data: user
        })
        
})

exports.updateUser= catchAsync(async (req, res, next)=>{

    //Disallowing pasword update here
        const filteredBody= filterObj(req.body, 'name', 'email', 'aboutMe')
        
        if (req.body.password || req.body.passwordConfirm){
            return next(new AppError('Wrong route to update password', 400))
        };
    //Adding imageCover name to filtered body
        if (req.file) filteredBody.imageCover= req.file.filename

        const user=await User.findByIdAndUpdate(req.params.id, filteredBody, {
            new: true, 
            runValidators: false
        })

        if(!user){
            return (next(new AppError('no user with this id', 404)))
        }

        res.status(200).json({
            message: 'success',
            data: user
        });

});


exports.myProfile= catchAsync(async (req, res, next)=>{

        const myID = res.locals.user.id
        const me= await User.findById(myID)


        if(me.role==='user'){
            me.populate('agent')
            
        }else if(me.role === 'agent'){
            me.populate('user')
        };
    
        res.status(200).send({
            status: 'success',
            myDetail: me
        })
});

exports.updateMe= catchAsync(async (req, res, next)=>{

    const myID = res.locals.user.email

    const filteredBody= filterObj(req.body, 'firstName','lastName', 'email', 'bio')
        
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError('Wrong route to update password', 400))
    };
    //Adding imageCover name to filtered body
    if (req.file) filteredBody.imageCover= req.file.filename

    
    const me= await User.findOneAndUpdate({email:myID}, filteredBody, {
        new:true,
        runValidators: true
    });

    // if(me.role==='user'){
    //     me.populate('agent')
        
    // }else if(me.role === 'agent'){
    //     me.populate('user')
    // };

    res.status(200).send({
        status: 'success',
        myDetail: me
    })
});

exports.deactivateAccount= catchAsync(async(req, res, next)=>{

        const myID= res.locals.user._id

        await User.findByIdAndUpdate(myID, {active: false}, {new: true});
        
        res.status(200).json({
            message : 'success', 
            data: "your account has been deactivated"
        })

});

exports.activateAccount= catchAsync(async(req, res, next)=>{

        const user = await User.findOneAndUpdate(req.body.email, {active: true}, {new: true, runValidators:false})
        if(!user){
            return (next(new AppError('no user with this id', 404)))
        }
        
        new Email.sendActivate()

        res.status(200).json({
            message: 'success',
            data: user
        })
    
});

exports.deleteAccount= catchAsync(async(req, res, next)=>{
        const user= await User.findByIdAndDelete(req.params.id)

        if(!user){
            return(new AppError('no user with this id', 404))
        }

        res.status(200).json({
            status: 'success',
            message: "deleted sucessfully"
        })
})