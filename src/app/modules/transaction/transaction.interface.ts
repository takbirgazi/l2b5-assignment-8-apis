import { Types } from 'mongoose';

export enum TransactionType {
    SEND_MONEY = 'SEND_MONEY',
    RECEIVE_MONEY = 'RECEIVE_MONEY',
    CASH_IN = 'CASH_IN',
    CASH_OUT = 'CASH_OUT'
}

export interface ITransaction {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    amount: number;
    type: TransactionType;
    transactionId: string,
    transactionWith: Types.ObjectId;
    fee?: number,
    commission?: number,
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
