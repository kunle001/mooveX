const Apartment= require('../Models/apartmentModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync= require('../utils/catchAsync')
const AppError = require('../utils/appError');

//getting address by ip
const satelize= require('satelize');



exports.getAllApartments= catchAsync(async (req, res, next)=>{

        let filter={};
        if(req.params.apartmentId) filter={tour: req.params.apartmentId}

        const features = new APIFeatures(Apartment.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()

        const apartments= await features.query
        console.log(req.query)


        res.status(200).json({

            status: 'success',
            results: apartments.length,
            data: apartments
        });
});


exports.getOneApartment= catchAsync(async(req, res, next)=> {

        const apartment= await Apartment.findById(req.params.id).populate('reviews')

        if(!apartment){
            return next(new AppError('apartment was not found', 404))  
        } 

        res.status(200).json({
            message: 'success',
            data: apartment
        })

})
;
exports.createApartment =  catchAsync( async (req, res, next) => {
        const apartment= await Apartment.create(req.body)
        
        res.status(201).json({
            status: 'success',
            data:{
                data:apartment
            }
        })

});

exports.getTop5Cheap= catchAsync(async(req, res, next)=>{
    req.query.limit= '5'
    req.query.sort= '-ratingsAverage, price -ratingsQuantity';
    req.query.fields= 'name'

    const apartments= await Apartment.find()

    res.status(200).json({
        status: 'success',
        data: apartments
    })


});

exports.updateApartment = catchAsync(async (req, res, next)=>{
    
        const apartment= await Apartment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
          });
          
        if(!apartment) return next(new AppError('tour was not found', 404))

        res.status(200).json({
            message: 'success', 
            data: apartment
    })

});

exports.deleteApartment=catchAsync(async (req, res, next)=>{

        const apartment= await Apartment.findByIdAndDelete(req.params.id)

        if(!apartment) return next(new AppError('tour was not found', 404))

        res.status(200).json({
            data: 'null'
        })

});

exports.getApartmentAround= catchAsync(async(req, res, next)=>{
        const {distance, latlng, unit}= req.params
        const [lat, lng]= latlng.split(',')

        const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

        console.log(radius)

        if(!lat || !lng ) res.status(400).json({
            message: ' please provide latitude and logitude'
        })

        const apartments= await Apartment.find({location:{
            $geoWithin:{$centerSphere: [[lng, lat], radius]}
        }});
        res.status(200).json({
            status: 'success',
            data:{
                data: apartments
            }
        })

});

exports.getDistances = catchAsync(async (req, res, next) => {
    /*
    Getting the user locating based on ip address, and using the latitude and logitude to get the 
    nearest available apartment around them.
    */
        const userLocationInfo= satelize.satelize({ip:'102.89.34.172'}, function(err,payload){
            console.log('kunle position',payload  )
        })

        /*
        this can only be completed after rendering to the front end
        */

        const {latlng, unit}=req.params;
        const [lat, lng]= latlng.split(',');

        const multiplier= unit==='mi' ? 0.00621 : 0.001

        if(!lat || !lng){
            res.status(400).json({
                message: 'no lat and long'
            });
        }

        const distances= await Apartment.aggregate([
            {
            $geoNear:{
                near:{
                    type: 'Point',
                    coordinates: [lng*1, lat*1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project:{
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data:{
            data: distances
        }
    })

  });




