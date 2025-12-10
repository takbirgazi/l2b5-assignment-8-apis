import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "./transaction.mode";
import { QueryBuilder } from "../../utils/QueryBuilder";


const getTransactionHistory = async (payload: JwtPayload, query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Transaction.find({ user: payload.userId })
        .populate([
            { path: 'user', select: 'name email role' },
            { path: 'transactionWith', select: 'name email role' }
        ]), query);

    const transactionHistory = queryBuilder
        .search(["transactionId"])
        .paginate();

    const [data, meta] = await Promise.all([
        transactionHistory.build(),
        queryBuilder.getMeta({ user: payload.userId }) // Pass filter for meta
    ]);
    return {
        data,
        meta
    };
};

const getAllTransactionHistory = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Transaction.find()
        .populate([
            { path: 'user', select: 'name email role' },
            { path: 'transactionWith', select: 'name email role' }
        ]), query);

    const allTransactionHistory = queryBuilder
        .search(["transactionId"])
        .paginate();

    const [data, meta] = await Promise.all([
        allTransactionHistory.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    };
};

export const TransactionService = {
    getTransactionHistory,
    getAllTransactionHistory,
}