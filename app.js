const express= require('express')
const morgan= require('morgan')
const apartmentRouter= require('./Routes/apartmentRoutes')
const appError= require('./utils/appError')


// start App
const app=express();
app.use(express.json({}));

app.enable('trust proxy');


// app.use(express.static(path.join(__dirname, 'public')));

// if(process.env.NODE_ENV==='development'){
//     app.use(morgan('dev'))
// };

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));// Body parser, reading data from body into req.body



// Test middleware
app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});

//Routes

app.use('/api/v1/apartments', apartmentRouter);

app.all('*', (req, res, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
  });
  


module.exports= app;