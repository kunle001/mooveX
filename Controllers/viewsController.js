const Apartment= require('../Models/apartmentModel');
const catchAsync= require('../utils/catchAsync')
const appError= require('../utils/appError');
const AppError = require('../utils/appError');
const User= require('../Models/userModel')
const APIFeatures= require('../utils/apiFeatures')
const Payment= require('../Models/paymentModel')
const facebookStrategy= require('passport-facebook').Strategy
const passport= require('passport')


exports.homePage=catchAsync(async (req, res)=>{
    let filter={role: 'agent'};
    if(req.params.apartmentId) filter={tour: req.params.apartmentId}

    const features = new APIFeatures(User.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const agents= await features.query

    const apartments=await Apartment.find().sort({price:1});

    req.query.limit= '5'
    req.query.sort= '-ratingsAverage, price -ratingsQuantity';
    req.query.fields= 'name'

    const top3cheap= await Apartment.find().populate('reviews')

    
    res.status(200).render('home', {
        apartments,
        title: 'Welcome',
        agents,
        topCheap: top3cheap
    })
    
});

exports.login= catchAsync(async(req, res)=>{
    res.status(200).render('login',{
        title: 'Login|signup here'
    })
});

exports.apartmentPage= catchAsync(async (req, res, next)=>{

    const apartment = await Apartment.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
      });
    if(!apartment){
        return next(new AppError('There is no apartment with this id', 404))
    }
    res.status(200).render('property', {
        apartment,
        title: apartment.name
    })
});


exports.agentPage= catchAsync(async (req, res, next)=>{
    let filter={role: 'agent'};

    const features = new APIFeatures(User.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const agents= await features.query
    
    res.status(200).render('agents',{
        agents,
        title: 'agents'
    })
});

exports.userProfile= catchAsync(async (req, res, next)=>{
    const me= res.locals.user._id
    const user= await User.findById(me);

    const payments= await Payment.find({user: res.locals.user._id})
    
    res.status(200).render('userProfile', {
        user,
        payments,
        title: 'my-profile'
    })
});

exports.signUp= catchAsync(async(req, res, next)=>{
    res.status(200).render('signup', {
        title: 'signup'
    })
})

exports.allApartments= catchAsync(async(req, res, next)=>{
    

        const apartments= await Apartment.find().sort({createdAt:1});

        
    res.status(200).render('allApartments', {
        apartments,
        title: 'available apartments'
    })

});

exports.Profile= catchAsync(async(req, res, next)=>{
    const user= await User.findById(req.params.userId)

    const payments= await Payment.findById(req.params.userId)

    res.status(200).render('userProfile', {
        user, 
        payments,
        title: user.firstName
    })
})

exports.createApartment= catchAsync(async(req, res, next)=>{
    res.status(200).render('c-Apartment')
});

exports.updateUser = catchAsync(async(req, res, next)=>{
    res.status(200).render('updateProfile')
});

exports.forgotPassword= async(req, res, next)=>{
    res.status(200).render('forgotPassword')
};

exports.adminPanel= async(req, res, next)=>{
    const users = await User.find()
    console.log(users.length)
    res.status(200).render('admin/adminPanel', {
        users
    })
}


exports.sigupFacebook= catchAsync(async(req, res, next)=>{

    passport.use(new facebookStrategy({
        clientID: process.env.FACEBOOKCLIENTID,
        clientSecret: process.env.FACEBOOKCLIENTSECRET,
        callbackURL: `${req.protocol}://${req.get('host')}/api/v1/users/facebook/callback`,
        profileFields: ['id', 'displayName', 'name', 'gender',"picture.type(large)", "email" ]
    },//facebook will send back the token and profile 
    async function(token, refreshToken, profile, done){
            const data= {
                id: profile.id,
                token,
                name: profile.name.givenName+' '+profile.name.familyName,
                email: profile.emails[0].value,
                gender:profile.gender,
                photo: profile.photos[0].value
            }
            const user= await User.create(data)
            if(err){
             console.log(err) 
             throw err;
            }    
            return done(null,  user)

    }));


    passport.serializeUser(function(user, done){
        done(null, user.id)
    })
    
    passport.deserializeUser(async function(id, done){

        await User.findById(id, function(err,user){
            done(err,user)
        })
    });
    next();
});


exports.adminPanelUsersInfo= catchAsync(async(req, res, next)=>{
    const users = await User.find()
    res.status(200).render('admin/users')
});

exports.getApartmentAround= catchAsync(async(req, res, next)=>{

    let filter={role: 'agent'};

    const features = new APIFeatures(User.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const agents= await features.query

    req.query.limit= '5'
    req.query.sort= '-ratingsAverage, price -ratingsQuantity';
    req.query.fields= 'name'

    const top3cheap= await Apartment.find().populate('reviews')

    
       const {distance, latlng, unit}= req.params
        const [lat, lng]= latlng.split(',')

        const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

        if(!lat || !lng ) res.status(400).json({
            message: ' please provide latitude and logitude'
        });

        // await User.findByIdAndUpdate(req.user._id, 
        //   {currentLocation:[lat*1,lng*1]},
        //   {
        //     new:true,
        //     runValidators:true
        //   });
        
        const apartments= await Apartment.find({location:{
            $geoWithin:{$centerSphere: [[lng, lat], radius]}
        }});
        console.log('got here')
    res.status(200).render('near',{
        apartments,
        title: 'Closest',
        agents,
        topCheap: top3cheap
    })

});













