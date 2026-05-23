import mongoose from "mongoose";
import { env } from "../config/env.js";
const connectDB = async () => {
    try {
        if(!env.MONGO_URI){
            throw new Error("MONGO_URI is not defined");
        }
       const connectionInstance = await mongoose.connect(`${env.MONGO_URI}/blogs`);
       console.log(`Database connected with ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("database not connected ",error)
        process.exit(1)
    }
}

export default connectDB