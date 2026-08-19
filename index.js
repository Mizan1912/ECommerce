import connectDB from "./src/config/db.js";
import env from "./src/config/env.js"
import app from "./app.js"


const startServer = async ()=>{
    await connectDB();

    app.listen(env.PORT,()=>{
        console.log("Server running on port "+env.PORT);
        
    })
}

startServer()