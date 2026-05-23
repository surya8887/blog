import { prisma } from "../config/db.js";

const singupservice=async(email:string,password:string)=>{
    const user = await prisma.user.create({data:{email,password}});
    return user;
}   


export {singupservice};