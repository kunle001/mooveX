const path= require('path')
const cookieParser = require('cookie-parser')
const express= require('express')
const morgan= require('morgan')
const passport= require('passport')
const session= require('express-session')

//Roters
const apartmentRouter= require('./Routes/apartmentRoutes')
const userRouter= require('./Routes/userRoutes')
const paymentRouter= require('./Routes/paymentRoute')
const reviewRouter= require('./Routes/reviewRoutes')
const bookingRouter= require('./Routes/bookingRoute')
const viewsRouter= require('./Routes/viewsRoute')



//ERror Handler
const AppError= require('./utils/appError')
const globalError= require('./Controllers/errorController')


// start App
const app=express();

//Trust proxy
app.enable('trust proxy')

//setting app to use pug

app.use(session({secret: "thisissecretkey"}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

//Serving static files
app.use(express.static(path.join(__dirname, 'html')));


app.use(express.json({}));



// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));// Body parser, reading data from body into req.body




// Test middleware
app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});

//Routes
app.use('/', viewsRouter)

app.use('/api/v1/apartments', apartmentRouter);
app.use('/api/v1/users', userRouter )
app.use('/api/v1/payments', paymentRouter)
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next)=>{
    next(new AppError(`Page ${req.originalUrl} is not found`, 404));

});

app.use(globalError);
   


module.exports= app;