import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import statusCode from "http-status-codes";
import { TransactionService } from "./transaction.service";
import { JwtPayload } from "jsonwebtoken";



const getTransactionHistory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.user;
    const query = req.query;
    const transaction = await TransactionService.getTransactionHistory(payload as JwtPayload, query as Record<string, string>);
    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "Transaction Retrieve Successfully!",
        data: transaction.data,
        meta: transaction.meta
    });
});

const getAllTransactionHistory = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const allTransaction = await TransactionService.getAllTransactionHistory(query as Record<string, string>);

    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "All Transaction Retrieve Successfully!",
        data: allTransaction.data,
        meta: allTransaction.meta
    });
})


export const TransactionController = {
    getTransactionHistory,
    getAllTransactionHistory,
}