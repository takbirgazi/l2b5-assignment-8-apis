import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import statusCode from "http-status-codes";
import { SummeryService } from "./analytics.service";
import { JwtPayload } from "jsonwebtoken";

const getAllSummery = catchAsync(async (req: Request, res: Response) => {

    const allSummery = await SummeryService.getAllSummery();

    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "All Summery Retrieve Successfully!",
        data: allSummery
    });
});

const getTransactionSummary = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user; // Assuming auth middleware sets req.user
    const summary = await SummeryService.getTransactionTypeSummary(decodedToken as JwtPayload);
    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "Transaction summary retrieved successfully!",
        data: summary,
    });
});

const getTransactionSummaryByDay = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user; // Assuming auth middleware sets req.user
    const summary = await SummeryService.getTransactionSummaryByDay(decodedToken as JwtPayload);
    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "Transaction summary retrieved successfully!",
        data: summary,
    });
});


export const SummeryController = {
    getAllSummery,
    getTransactionSummary,
    getTransactionSummaryByDay
}