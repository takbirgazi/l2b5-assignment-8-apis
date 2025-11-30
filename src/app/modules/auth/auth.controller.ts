import { Request, Response } from "express";
import statusCode from 'http-status-codes';
import { catchAsync } from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";


const login = catchAsync(async (req: Request, res: Response) => {

    const result = await AuthService.login();
    sendResponse(res, {
        success: true,
        statusCode: statusCode.OK,
        message: "Log In Successfully!",
        data: result
    })
});



export const AuthControllers = {
    login,
}