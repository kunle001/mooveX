const Apartment= require('../Models/apartmentModel')
const APIFeatures = require('../utils/apiFeatures')


exports.getAllApartments= async (req, res, next)=>{
    try{
        let filter={};
        if(req.params.apartmentId) filter={tour: req.params.apartmentId}

        const features = new APIFeatures(Apartment.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()

        const apartments= await features.query


        res.status(200).json({

            status: 'success',
            results: apartments.length,
            data: apartments
        });
    }catch(err){res.status(404).json({
        message: 'Error',
        data: err.message
    })}

};

exports.getOneApartment= async(req, res, next)=> {
    try{
        const apartment= await Apartment.findById(req.params.id)


        res.status(200).json({
            message: 'success',
            data: apartment
        })

    }catch(err){
        res.status(404).json({
            error: err.message
        })
    }



}

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
        const apartment= await Apartment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
          });
      
        res.status(200).json({
            message: 'success', 
            data: apartment
    })

    }catch(err){
        res.status({
            message: 'Error',
            data: err.message
        })
    }

};

exports.deleteApartment= async (req, res, next)=>{

    try{

        await Apartment.findByIdAndDelete(req.params.id)
        
        res.status(200).json({
            data: 'null'
        })
    }catch(err){
        error: err.message
    }

}

