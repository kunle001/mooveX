const Apartment= require('../Models/apartmentModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync= require('../utils/catchAsync')
const AppError = require('../utils/appError');
const multer = require('multer')
const vupload= require('express-fileupload')
const fetch = require('node-fetch')
const {google}= require('googleapis')
//getting address by ip
const sharp = require('sharp');

const multerStorage = multer.memoryStorage({
        destination: (req, file, cb) =>{
        if (file.mimetype.startsWith('video')){ 
            (file)
            return cb(null, 'public/images/apartments/videos')
            
        }
    }, 
    filename: (req, file, cb)=>{
        if (file.mimetype.startsWith('video')) {
            const ext= file.mimetype.split('/')[1];``
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

exports.uploadVideo= catchAsync(async(req, res, next)=>{
    if (req.files.video){
        const videoStorage = multer.diskStorage({
                destination: (req, file, cb) =>{
        cb(null, 'public/images/apartments/videos');
            
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



const scopes= 'https://www.googleapis.com/auth/analytics.readonly'
CLIENT_EMAIL= "google-analytics@smiling-diode-366310.iam.gserviceaccount.com"

PRIVATE_KEY= "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCKxMITmTR/j/hA\nE0OqWyeC6c8C5yDQ/LU2CQz+6yy63TjO4//5mKPZT4gAIAwaHjmgxKAlNZ4E5J5A\nk0dDR9s80N1BW6QMXaAGJ8j07VIa7XlB8Xb5Nz4Lf5NaU3f6RbIslZD0NeEBM7VO\nRPV6qtoep0Xf+PN0apYVioxxAHXoaNTD8oGsfsZMtbnpHg03OpcGyaI6OJ8cH2q8\nmfmlk+Hxvn4OEt/Uq4RHPZ6MDorYc4GmKn1h9vJ5xDtUtrhJnsmuGEoLDGy5HjJU\nOF90ag503An9w58xjJ04YamGzIO5Q1Vq5eCzl2bdjviDwgbw0iHxk6lv2WuimXrx\nEvzcjfqfAgMBAAECggEAETI4v/z9ncvVflCPfg41uJSza9oAcxAd1J231+SEx9NK\nNY6DgLFYUexNH4GD074THh0U9gd4QYWjJsAZgKOS7i0OfgmWgVceJs/J/gVlZfja\nTJWuTKElNdTlXw12PLQOVFVkf8l9dzdVLGcslGWVCgoTL/dwaT4cGHycKBS1MnY8\ndw8dY+zWBgNBpnmj+8Zsej575GV7QaBgyU4oITe0YMGbpLKxRr2unnwo1XoLxWT4\nmhR5gSTRmOQrRwKntniUTztmVVwHzgbNY5BqAVc399pEeWNejtPC9p69n/1MK62x\n/udJFreJRGB9eF7mJIV7P3tI4/Ld4xt3JtRkbGPK4QKBgQDBswcX9RvgoTguobA2\ns613Rp/ZYG+y9+IDUU5kUB93RaXzqJ59wh4rF/Tx2w0TZIUQDBPW0f+TsPowNkqc\nCLC5i6uIYgCMo4vypb1UevNkY9wzgTseyeCixsX4P6U6mGnuyIlG2WTp+p6+a67p\nli+GBCIYtlP+9kJ68esZCu7N7QKBgQC3ZsxsWjiuL4GBY7yw+quWVge3MRQKIvLP\nY21UYFh1gFKniK9/fWGYWW+H8sZVjYu8/X7lbdlxbvWJ0h7RHKZGBZoZRHAez6Lz\n6Y8VV6eLilnwLVrmzY/DJG5LD5Uv4UjEgjYEtiiRxxoHocAyIn75v5gNaFQQ/L27\ndXDABv35OwKBgBkHHN+HmDaKHkxIMBChXsSOp5Da2RPy2406MDrd73Ll2O+G1hPB\nxUwkKE4n06Sx1E+if929/JwEvg8EtNc8eDlBRsS0hQWnDCoqKDCGQnSyQn2VMSJl\nS1U9Ac91yc+saeOknbg91sA01dYc69jawwE5/33Z8Th8cVKZd5sgwoJxAoGAXy2H\nKzgLMEJRKC/1bbc5MxTEfkqHBteqQPxtcZtqbNhCjNU/lp8f9et8GQZh7WY+vb6k\nizZd4SNfY73a5lTC6ZXgqfo9YZAKFiEAc2gA+Ea9dAploV/OmswePPACUU3N8MVO\neVV7amP0Wz+TObFzSfMnWtXowsQXRuCkudMnHJ8CgYEAtjOo41ce943r+Ryg/YWv\nFJZ0PJXJY9Pw+hdcglADgEzvOcPt3WHykx7ah65sIjDGCqr1+1DlQL89bYLCghTK\nHbaZ0eD7FX12RsysTxiV3ohKCQGI8HgsiAimPKtDH51knD1EXFETgRoUrCrDeEQG\nzNo3Z/lsjUO8vqh4NkpiSjs=\n-----END PRIVATE KEY-----\n"

const jwt= new google.auth.JWT(CLIENT_EMAIL, null, PRIVATE_KEY.replace(/\\n/g, "\n"),scopes)

const view_id= 279016709

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
  