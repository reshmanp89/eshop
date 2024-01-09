const express =require('express')
const path=require('path')
const app =express();
const mongoose=require('mongoose')

const homeRouter=require('./routers/home')
const userRouter=require('./routers/user')
const productRouter=require('./routers/product')
const adminRouter=require('./routers/adminRoute')
const session=require('express-session')
const methodOveride=require('method-override')
// load environment variable from .env file
require("dotenv").config();

// set up Ejs

app.set("view engine", "ejs");

app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride('_method'));
//session

app.use(session({
    secret:'secret1234',
    resave:false,
    saveUninitialized:true
}))

//static file
app.use(express.static(path.join(__dirname,"public")))





//routers

app.use('/',homeRouter)
app.use('/user',userRouter)
app.use('/product',productRouter)
app.use('/admin',adminRouter)
//db connection

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("Database connected");
})
.catch((err)=>{
    console.log(err);
})


app.listen(5001,()=>{
    console.log("server running");
})