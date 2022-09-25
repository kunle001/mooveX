const mongoose= require('mongoose')
const app= require('./app');
const dotenv= require('dotenv');




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




  














