import { prisma } from "../config/db.js";
import {ApiError, ApiResponse} from "@blog/common";

const singupservice=async(email:string,password:string)=>{
    const user = await prisma.user.create({data:{email,password}});
    return user;
}   


export {singupservice};