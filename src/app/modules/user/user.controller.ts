import { Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse";
import statusCode from "http-status-codes";
import { UserService } from "./user.service";
import httpStatusCode from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";


const createUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = await UserService.createUser(payload);
    sendResponse(res, {
        statusCode: statusCode.CREATED,
        success: true,
        message: "User Created Successfully!",
        data: user
    })
})
const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = await req.params.id;
    // const token = req.headers.authorization;
    // const decodedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const decodedToken = req.user;
    const payload = req.body;

    const updateData = await UserService.updateUser(userId, payload, decodedToken as JwtPayload);

    sendResponse(res, {
        statusCode: httpStatusCode.CREATED,
        success: true,
        message: "User Updated Successfully!",
        data: updateData
    })
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const users = await UserService.getAllUser(query as Record<string, string>);
    sendResponse(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "User Retrieve Successfully!",
        meta: users.meta,
        data: users.data,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserService.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await UserService.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatusCode.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
})


export const UserControllers = {
    createUser,
    getAllUser,
    updateUser,
    getMe,
    getSingleUser,
}