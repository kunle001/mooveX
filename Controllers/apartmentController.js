const Apartment= require('../Models/apartmentModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync= require('../utils/catchAsync')
const AppError = require('../utils/appError');
const multer = require('multer')
const vupload= require('express-fileupload')

//getting address by ip
const satelize= require('satelize');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage({
        destination: (req, file, cb) =>{
        if (file.mimetype.startsWith('video')){ 
            (file)
            return cb(null, 'html/images/apartments/videos')
            
        }
    }, 
    filename: (req, file, cb)=>{
        if (file.mimetype.startsWith('video')) {
            const ext= file.mimetype.split('/')[1];
            return cb(null, `user-${req.params.id}-${Date.now()}.${ext}`)
        }

        
    }
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  }else if(file.mimetype.startsWith('video')){
    cb(null, true)
  }
  else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
//   limits: {
//     fileSize: 20000000 //20MB
//   },
  fileFilter: multerFilter
});



exports.uploadApartmentImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  {name: 'plan', maxCount: 1},
  {name: 'video', maxCount: 1}
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeApartmentImages = catchAsync(async (req, res, next) => {
    
  if (!req.files.imageCover || !req.files.images || !req.files.plan) return next();
    // 1) Cover image
  req.body.imageCover = `apartment-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`html/images/apartments/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `apartment-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`html/images/apartments/${filename}`);

      req.body.images.push(filename);
    })
  );
    //3) plan
    req.body.plan = `apartment-${req.params.id}-${Date.now()}-plan.jpeg`;
    await sharp(req.files.plan[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`html/images/plan/${req.body.plan}`);

  next();
});

exports.uploadVideo= catchAsync(async(req, res, next)=>{
    if (req.files.video){
        const videoStorage = multer.diskStorage({
                destination: (req, file, cb) =>{
        cb(null, 'html/images/apartments/videos');
            
    }, 
            filename: (req, file, cb)=>{
                    const ext= file.mimetype.split('/')[1];
                    cb(null, `apartment-${req.params.id}-video-${Date.now()}.${ext}`)
                }
       });
       const fileFilter= (req, file, cb)=> {
        // upload only mp4 and mkv format
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
           return cb(new AppError('Please upload a video'))
        }
           
        cb(undefined, true)
     }
    
       const videoUpload = multer({
        storage: videoStorage,
        limits: {
        fileSize: 10000000 // 10000000 Bytes = 10 MB
        },
        fileFilter: fileFilter
    })
    req.body.video= `apartment-${req.params.id}-video-${Date.now()}.mp4`
    videoUpload.single(req.files.video)
    }
    

    next()

});



exports.getAllApartments= catchAsync(async (req, res, next)=>{

        let filter={};
        if(req.params.apartmentId) filter={apartment: req.params.apartmentId}

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

        //Adding imageCover name to filtered body
        if (req.file) req.body.imageCover = req.file.filename

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
          
        if(!apartment) return next(new AppError('apartment was not found', 404))
        res.status(200).json({
            message: 'success', 
            data: apartment
    })

});

exports.deleteApartment=catchAsync(async (req, res, next)=>{

        const apartment= await Apartment.findByIdAndDelete(req.params.id)

        if(!apartment) return next(new AppError('apartment was not found', 404))

        res.status(200).json({
            data: 'null'
        })

});

exports.getApartmentAround= catchAsync(async(req, res, next)=>{
        const {distance, latlng, unit}= req.params
        const [lat, lng]= latlng.split(',')

        const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;


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




