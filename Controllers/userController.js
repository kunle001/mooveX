const { findByIdAndDelete } = require('../Models/apartmentModel');
const User= require('../Models/userModel')
const APIFeatures= require('../utils/apiFeatures')
const Email= require('../utils/email')
const catchAsync= require('../utils/catchAsync')



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
        console.log(user.role)

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

        const user=await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true
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