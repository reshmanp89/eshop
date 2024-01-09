const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const moment=require('moment')
const sendVerificationEmail=require('../helpers/sendmail')
const authMiddleware=require('../helpers/auth')

app.use(express.json());
// router.use(authMiddleware.authenticateUser)
//usr login
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).render("login", { error: "All field required" });
  }

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .render("login", { error: "Invalid email or Password" });
    }
    if(user.blocked){
     return  res.status(400).render('login',{error:'The account is blocked'})
    }
    const passwordMatch = await bcrypt.compareSync(password, user.password);
    if (passwordMatch) {
     
    if(user.is_varified )
    {
      req.session.userLoggedIn= true;
      req.session.username=user.username;
      res.status(200).redirect("/product");
     
    }
    else{
      res.render('login',{error:"Please verify your mail"})
    }
    }
    else{
      return res
      .status(400)
      .render("login", { error: "Invalid email or password" });
    }
   
  } catch (err) {
    console.log(err);
   return res.status(500).render("login", { error: "Internal server error" });

  }
});

router.get("/signup", (req, res) => {
  res.render("signup");
});
router.post("/signup", async (req, res) => {
//   console.log(req.body);
  const { username, email, password ,confirmPassword} = req.body;




  //validate the fields
  const errors={};
 
  if(!username)
  {
    errors.username='Username is required';
    

  }else if(username.length<3){
    errors.username="Username must be atleast 3 character"
  }
  if(!email){
    errors.email='Email is required';

  } else{
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email))
    {
        errors.email='Inavlid email address'
    }
  }
  if(!password)
  {
    errors.password='Password is required';

  }else if(password.length<4)
  {
    errors.password="Password must be at least 4 characters'"
  }
  if(!confirmPassword)
  {
    errors.confirmPassword="confirm password is required"

  }
  else if(confirmPassword !== password)
  {
    errors.confirmPassword='Password do not match'
  }
   // check  validation errors
   if (Object.keys(errors).length > 0) {
    return res.status(400).render('signup', { errors });
  }

  //check the user already exist

  const existUser = await User.findOne({ email });

  if (existUser) {


    return res.status(400).render("signup", { error: "User already exist",errors });
  }

  try {
      
    //generate a otp
     const otp=Math.floor(1000+Math.random()*9000).toString();

     //expiration time

     const expirationTime=moment().add(15,'minutes').toDate()

    let user = new User({
      username: username,
      email: email,
      password: bcrypt.hashSync(password, 10),
      confirmPassword:bcrypt.hashSync(confirmPassword,10),
      otp,
      otpExpires:expirationTime,

    });

   
      user = await user.save();
      sendVerificationEmail(user.email, user.otp,user.otpExpires);
      res.status(200).redirect("/user/signup");
    

  
    // console.log(user);


    
  } catch (err) {
    console.log(err);
    res.status(500).render("signup", { error: "Internal server error" });
  }
});
//verifymail

router.post('/verify',async(req,res)=>{
  console.log(req.body);
const {otp}=req.body;

try{
  const user=await User.findOne({otp})
  if(user)
  {
    user.is_varified=true;
    await user.save();
    return res.status(200).render('login')
  }

}
catch(err)
{
console.log(err);
res.status(500).render("signup", { error: "Internal server error" });
}

})


module.exports = router;
