const Apartment= require('../Models/apartmentModel')

class APIFeatures {
    constructor(query, queryString){
        this.query= query;
        this.queryString= queryString;
    }

    filter(){
        const queryObj = {...this.queryString};
        const excludedFields= ['page', 'sort', 'fields', 'limit']
        excludedFields.forEach(el=> delete queryObj[el]);

        //Advanced Filtering
        let queryStr= JSON.stringify(queryObj);
        queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}` )

        this.query = this.query.find(JSON.parse(queryStr))

        return this
    };

    sort(){
        if (this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query= this.query.sort(sortBy);

        }else{
            this.query= this.query.sort('-years')
        }
        return this
    };

    limitFields(){
        if(this.queryString.fields){
            const fields= this.queryString.fields.split(',').join(' ');
            this.query= this.query.select(fields)
        }else{
            this.query.select('-__v')
        }

        return this
    };

    paginate(){
        const page= this.queryString.page *1 || 1;
        const limit= this.queryString.limit * 1 || 10;
        const skip= (page-1) * limit 

        
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}

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
            message: 'sucess', 
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

