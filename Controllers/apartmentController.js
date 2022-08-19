const Apartment= require('../Models/apartmentModel')

exports.getAllApartments= async (req, res, next)=>{
    try{
        const apartments= await Apartment.find()

        res.status(200).json({
            status: 'success',
            data: apartments
        });
    }catch(err){res.status(404).json({
        message: 'Error',
        data: err.message
    })}

};

exports.createApartment = async (req, res, next) => {
    try {
        const apartment= await Apartment.create(req.body)
        
        res.status(201).json({
            status: 'success',
            data:{
                data:apartment
            }
        })

    } catch (err) {
        console.log(err, err.message)

        res.status(400).json({
            message: 'Error',
            data: err.message
        })

    }
};

exports.updateApartment = async (req, res, next)=>{
    
    try{ 
        const apartment= await Apartment.findByIdAndUpdate(req.params.id, req.params.body, {
            new: true,
            runValidators:true
        })
        res.status(200).json({
            message: 'Sucess', 
            data: apartment
    })
    }catch(err){
        res.status({
            message: 'Error',
            data: err.message
        })
    }

};

