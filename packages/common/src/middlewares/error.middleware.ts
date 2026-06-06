import { Request, Response, NextFunction } from "express";
import { ApiError } from "../apiError/index.js";
import { ApiResponse } from "../apiResponse/index.js";
import { logger } from "../logger/index.js";

const errorHandler = (error: Error, _: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors: any[] = [];

    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
        
        // Log client errors as warnings, server errors as actual errors
        if (statusCode >= 500) {
            logger.error({ err: error }, `[API Error] ${statusCode} - ${message}`);
        } else {
            logger.warn(`[API Warning] ${statusCode} - ${message}`);
        }
    } else {
        // Log unexpected unhandled exceptions with full stack trace
        logger.error({ err: error, stack: error.stack }, `[Unhandled Exception] 500 - ${error.message || "Internal Server Error"}`);
    }

    const response = new ApiResponse(statusCode, null, message);
    res.status(statusCode).json(response);
};

export { errorHandler };