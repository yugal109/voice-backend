
function isTeacher(req,res,next){

    if(req.user.userType=="teacher"){
        next();
    }else{
        return res.status(403).send("Access Denied.")
    }

    

}

module.exports=isTeacher