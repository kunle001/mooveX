const mongoose= require('mongoose')
const app= require('./app');
const dotenv= require('dotenv')


// process.on('uncaughtException', err=>{
//     console.log('uncaught exceptions, shutting down💥💥...')
//     console.log(err.name, err.message)
//     server.close(()=>{
//         process.exit(1)
//     })
// });


dotenv.config({path: './config.env'});


const DB= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(()=> console.log('DB connection successful'))

console.log(process.env.NODE_ENV);


const port = process.env.PORT || 3000;

const server= app.listen(port, () => {
    console.log(`App runing on port ${port}`);
  });




  














