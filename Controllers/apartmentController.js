const Apartment= require('../Models/apartmentModel')



exports.getAllApartments= (req, res, next)=>{
    next();
}

exports.createApartment= async(req, res, next)=>{
    console.log('Got here')
    try{
        const apartment= await Apartment.create(req.body)
        
        res.status(201).json({
            status: 'success',
            data:{
                data:apartment
            }
        })

    }catch(err){
        console.log(err, err.message)
        next()
    }
    next();
};

