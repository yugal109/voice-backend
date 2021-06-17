
function isLogged(req,res,next){
    if(!req.header("x-auth-token")){
        next()
    }else{
        res.status(403).send("Cannot go bitch")
    }
}


module.exports=isLogged