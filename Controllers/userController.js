const { findByIdAndDelete } = require('../Models/apartmentModel');
const User= require('../Models/userModel')
const APIFeatures= require('../utils/apiFeatures')
const Email= require('../utils/email')

exports.signUp = async (req, res, next)=>{
    try{
        const user= await User.create(req.body);
        const url= '127.0.0.1:3000/users'
        await new Email(user, url).sendWelcome()
        res.status(201).json({
            message: 'success',
            welcome: `You are welcome, Thanks for signing up ${req.body.firstName}`,
            data: user
        })

    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }


}

exports.getAllUsers= async(req, res, next)=>{
    try{
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



    }catch(err){
        res.status(400).json({
            errror: err.message
        })

    }
}

exports.getOneUser= async (req, res, next)=>{
    try{
        const user= await User.findById(req.params.id)

        res.status(200).json({
            message: 'success',
            data: user
        })
    }catch(err){
        res.status(404).json({
            message: err.message
        })

    }
}
exports.updateUser= async (req, res, next)=>{
    try{
        const user=await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true
        })

        res.status(200).json({
            message: 'success',
            data: user
        })
    }catch(err){
        console.log(err)
        res.status(404).json({
            message: err.message
        })
    }
}

exports.deactivateAccount= async(req, res, next)=>{
    try{
        const user= await User.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
        
        res.status(200).json({
            message : 'success', 
            data: "This user has been deleted"
        })
    }catch(err){
        res.status(404).json({
            message: err.message
        })
    }

}
exports.activateAccount= async(req, res, next)=>{
    try{
        const user = await User.findOneAndUpdate(req.body.email, {active: true}, {new: true, runValidators:false})

        res.status(200).json({
            message: 'success',
            data: user
        })
    }catch(err){
        res.status(404).json({
            error : err
        })
    }
}