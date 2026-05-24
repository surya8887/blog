import mongoose from "mongoose";
import { env } from "../config/env.js";
const connectDB = async () => {
    try {
        if(!env.MONGO_URI){
            throw new Error("MONGO_URI is not defined");
        }
        const uriObj = new URL(env.MONGO_URI);
        uriObj.pathname = "/blogs";
        const uri = uriObj.toString();
        const connectionInstance = await mongoose.connect(uri);
        console.log(`Database connected with ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("database not connected ",error)
        process.exit(1)
    }
}

export default connectDB