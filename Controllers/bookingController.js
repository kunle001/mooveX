const Booking= require('../Models/bookSectionModel');
const AppError= require('../utils/appError')
const catchAsync= require('../utils/catchAsync')


exports.createBooking= async (req, res, next)=>{
    try{
        req.body.apartment= req.params.apartmentId;
        req.body.user= res.locals.user.id;
        req.body.agent= req.params.agentId

        
        const booking=await Booking.create(req.body)

        res.status(201).json({
            status: 'success',
            data: booking
        })
    }catch(err){
        res.status(400).json({
            message: "You already Have a Booking with this agent and this apartment"
        })
    }

}

exports.getBookings= catchAsync(async(req, res, next)=>{

        const bookings= await Booking.find({user:res.locals.user.id});
        
        if(!bookings){
            return(next(new AppError('no booking with this id', 404)))
        }

        res.status(200).json({
            status: 'success',
            data: bookings
        })

});