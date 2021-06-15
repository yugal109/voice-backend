function admin(req,res,next){
    if(req.user && req.user.isAdmin==false){
        return res.status(403).send("Access Denied Bitch!!!")
    }
    next()
}
module.exports=admin