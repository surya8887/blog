import { Request, Response, NextFunction } from "express";
import { ApiError } from "../apiError";
import { ApiResponse } from "../apiResponse";

const errorHandler = (error: Error, _: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors: any[] = [];

    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
    }

    const response = new ApiResponse(statusCode, null, message);
    res.status(statusCode).json(response);
};

export { errorHandler };