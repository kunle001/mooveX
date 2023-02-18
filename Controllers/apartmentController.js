const Apartment= require('../Models/apartmentModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync= require('../utils/catchAsync')
const AppError = require('../utils/appError');
const multer = require('multer')
const {google}= require('googleapis')
//getting address by ip
const sharp = require('sharp');
const User = require('../Models/userModel');

const multerStorage = multer.diskStorage({
        destination: (req, file, cb) =>{
        if (file.mimetype.startsWith('video')){ 
              cb(null, 'public/images/apartments/videos');
        }
    }, 
    filename: (req, file, cb)=>{
        if (file.mimetype.startsWith('video')) {
            const ext= file.mimetype.split('/')[1];
            cb(null, `user-${req.params.id}-${Date.now()}.${ext}`)
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
  fileFilter: multerFilter
});



exports.uploadApartmentImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  {name: 'plan', maxCount: 1},
  {name: 'video', maxCount: 1}
]);


exports.resizeApartmentImages = catchAsync(async (req, res, next) => {
  console.log('got here')
  if (!req.files.imageCover) return next();
    // 1) Cover image
  req.body.imageCover = `apartment-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/apartments/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `apartment-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/apartments/${filename}`);

      req.body.images.push(filename);
    })
  );
    //3) plan
    req.body.plan = `apartment-${req.params.id}-${Date.now()}-plan.jpeg`;
    await sharp(req.files.plan[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/plan/${req.body.plan}`);

  next();
});

const videoStorage = multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null, 'public/images/apartments/videos');
  },
  filename:(req, file, cb)=>{
    const ext= file.mimetype.split('/')[1];
    cb(null, `apartment-${req.params.id}-video-${Date.now()}.${ext}`);
  },
});

const fileFilter= (req, file, cb)=>{
  if(file.mimetype.startsWith('video')){
    cb(null, true);
  }else{
    cb(new Error('Not a video file. Please upload video files'))
  }

}

exports.uploadVideo= catchAsync(async(req, res, next)=>{
  console.log(req.files)
  if(req.files.video){
    console.log('...uploading video')
    const upload= multer({storage:videoStorage,fileFilter}).single('video');
    upload(req,res, (err)=>{
      if(err){
        return next(new AppError('Failed to upload video', 500));
      }
      req.body.video= req.file.filename;
      next();
    });
  }
  next();
})



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
      

        await User.findByIdAndUpdate(req.user._id, 
          {currentLocation:[lat*1,lng*1]},
          {
            new:true,
            runValidators:true
          });

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

        if(!lat || !lng){
            res.status(400).json({
                message: 'no lat and long'
            });
        }

      //   const distances= await Apartment.aggregate([
      //     {
      //        $geoNear: {
      //           near: { type: "Point", coordinates: [ lat, lng] },
      //           distanceField: "distances",
      //           spherical: true
      //        }
      //     }
      //  ]);

      

    console.log(distances)
    console.log('got here')

    res.status(200).json({
        status: 'success',
        data: "distances"
    })

  });



const scopes= 'https://www.googleapis.com/auth/analytics.readonly'
const jwt= new google.auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY,scopes)


exports.googleAnalytics= async(req, res, next)=>{

    const result= await google.analytics('v3').data.ga.get({
      'auth': jwt,
      'ids': 'ga:'+ view_id,
      'start-date': '30daysAgo',
      'end-date':'today',
      'metrics': 'ga:pageviews'
    })

    console.log(result)

    if(!result) return next(new AppError('something went wrong', 400))
    res.status(200).json({
      status: 'success',
      data: result

    })
}
  