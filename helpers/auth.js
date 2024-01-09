
const authenticateUser=(req,res,next)=>{
    if(req.session && req.session.userLoggedIn)
    {
        return next()
    }
    else{
        return res.redirect('/user/login')
    }
}
module.exports=authenticateUser