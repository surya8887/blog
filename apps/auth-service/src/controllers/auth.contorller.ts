import type { Request, Response} from "express";
import { asyncHandler } from "@blog/common";
import { ApiResponse } from "@blog/common";
import { singupservice } from "../servies/auth.service.js";
import { signupValidation } from "../validation/auth.validation.js";

const signupHandler = asyncHandler(async(req:Request,res:Response) => {
    const validate = signupValidation.safeParse(req.body);
    if (!validate.success) {
        res.json(new ApiResponse(400, validate.error, "validation failed"));
        return;
    }
    const { email, password } = validate.data;
    const user = await singupservice(email, password);
    res.json(new ApiResponse(200, user, "user created successfully"));
});

export {signupHandler};