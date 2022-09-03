const cookieParser = require('cookie-parser')
const express= require('express')
const morgan= require('morgan')

//Roters
const apartmentRouter= require('./Routes/apartmentRoutes')
const userRouter= require('./Routes/userRoutes')
const reviewRouter= require('./Routes/reviewRoutes')
const bookingRouter= require('./Routes/bookingRoute')



//ERror Handler
const AppError= require('./utils/appError')
const globalError= require('./Controllers/errorController')


// start App
const app=express();
app.use(express.json({}));



// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));// Body parser, reading data from body into req.body



// Test middleware
app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});

//Routes

app.use('/api/v1/apartments', apartmentRouter);
app.use('/api/v1/users', userRouter )
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next)=>{
    next(new AppError(`Page ${req.originalUrl} is not found`, 404));

});

app.use(globalError);
   


module.exports= app;