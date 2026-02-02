const protect = async (req, res, next) => {
    try{
        const {userId} = await req.auth();
        if(!userId){
            return res.status(401).json({error: "Unauthorized"});
        }
      return  next();
    }
    catch(error){
        return res.status(401).json({error: "Unauthorized"});
    }
};

module.exports = { protect };