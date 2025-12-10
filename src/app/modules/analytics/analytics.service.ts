import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "../transaction/transaction.mode";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import { Role } from "../user/user.interface";


const getAllSummery = async () => {
    // Count users by role
    const totalUsers = await User.countDocuments({ role: "USER" });
    const totalAgents = await User.countDocuments({ role: "AGENT" });

    // Count total transactions
    const totalTransactions = await Transaction.countDocuments();

    return {
        data: {
            totalUsers,
            totalAgents,
            totalTransactions,
        },
    };
};

const getTransactionTypeSummary = async (decodedToken: JwtPayload) => {
    if (!decodedToken.userId) {
        throw new Error("User not authenticated");
    }

    let filter = {};

    // If user is not ADMIN or SUPER_ADMIN → show only own transactions
    if (decodedToken.role !== Role.ADMIN && decodedToken.role !== Role.SUPER_ADMIN) {
        const userObjectId = new mongoose.Types.ObjectId(decodedToken.userId);

        filter = {
            $or: [
                { user: userObjectId },
                { transactionWith: userObjectId }
            ]
        };
    }

    const summary = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = { CASH_OUT: 0, CASH_IN: 0, SEND_MONEY: 0, RECEIVE_MONEY: 0 };

    summary.forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(result, item._id)) {
            result[item._id] = item.count;
        }
    });

    return result;
};

const getTransactionSummaryByDay = async (decodedToken: JwtPayload) => {
    if (!decodedToken.userId) {
        throw new Error("User not authenticated");
    }

    const userObjectId = new mongoose.Types.ObjectId(decodedToken.userId);

    const filter =
        decodedToken.role !== Role.ADMIN && decodedToken.role !== Role.SUPER_ADMIN
            ? { $or: [{ user: userObjectId }, { transactionWith: userObjectId }] }
            : {};

    const summary = await Transaction.aggregate([
        { $match: filter },
        {
            $group: {
                _id: { $dayOfWeek: "$createdAt" }, // 1=Sunday, 2=Monday, ..., 7=Saturday
                amount: { $sum: "$amount" },
            },
        },
        { $sort: { "_id": 1 } },
    ]);

    // Map MongoDB day numbers to your labels
    const dayMap: Record<number, string> = {
        1: "Sun",
        2: "Mon",
        3: "Tue",
        4: "Wed",
        5: "Thu",
        6: "Fri",
        7: "Sat",
    };

    // Convert into desired output
    const transactions = summary.map((item) => ({
        date: dayMap[item._id],
        amount: item.amount,
    }));

    return transactions;
};

export const SummeryService = {
    getAllSummery,
    getTransactionTypeSummary,
    getTransactionSummaryByDay
}