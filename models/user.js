const mongoose=require('mongoose')
const userSchema= new mongoose.Schema({

    username:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    blocked:{
        type:Boolean,
        default:false

    },
    otp:{
      type:String
    },
    otpExpires:{
     type:Date,
    },
    is_varified:{
        type:Boolean,
        default:false
    }
})
const User= mongoose.model('user',userSchema)

module.exports=User;