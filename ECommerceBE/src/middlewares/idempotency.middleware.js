import Idempotency from './../models/Idempotency.model.js';

const idempotencyMiddleware = async(req,res,next)=>{

     const key = req.headers["idempotency-key"];

     if(!key){
          return next();
     }

     const existing=await Idempotency.findOne({
          key,
     })

     if(existing){
          return res.status(200).json(existing.response)
     }

     req.idempotencyKey=key;
     next();
}

export default idempotencyMiddleware;