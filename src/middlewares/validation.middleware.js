import ApiError from "../utils/ApiError.js";

const validate = (schema)=>{
    return (req,res,next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })

        if(!result.success){
            const errors = result.error.issues.map((err)=>({
                field: err.path.join("."),
                message: err.message,
            }))

            return next(
                new ApiError(
                422,
                "Validation failed",
                errors
                )
            );    
        }

        req.validatedData = result.data;

        next();
    }
}

export default validate;