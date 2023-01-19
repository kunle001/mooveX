const mongoose= require('mongoose')
const app= require('./app');
const dotenv= require('dotenv');


process.on('uncaughtException', err=>{
    console.log('UNCAUGHT EXCEPTION! 💥 shutting down..');
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config({path: './config.env'});


const DB= process.env.DATABASE

mongoose.connect(DB, {
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(()=> console.log('DB connection successful'))

console.log(process.env.NODE_ENV);


const port = process.env.PORT || 3010;

const server= app.listen(port, () => {
    console.log(`App runing on port ${port}`);
  });




  














