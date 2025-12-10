import { JwtPayload } from "jsonwebtoken";
import { IsActive, Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import statusCode from 'http-status-codes';
import { Wallet } from "./wallet.model";
import { WalletStatus } from "./wallet.interface";
import { Transaction } from "../transaction/transaction.mode";
import { TransactionType } from "../transaction/transaction.interface";
import { getTransactionId } from "../../utils/getTransactionId";

interface IPayload {
    balance?: number,
    status?: WalletStatus
}

const updateWallet = async (userEmail: string, payload: IPayload, decodedToken: JwtPayload) => {
    const ifUserExist = await User.findById(decodedToken.userId);
    if (!ifUserExist) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found!");
    }

    let ifChangeUserExist = await User.findOne({ email: userEmail }).select("-password").populate({
        path: "wallet",
        select: "balance status"
    });
    if (!ifChangeUserExist) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found!");
    }

    if (ifUserExist && payload.balance) {
        throw new AppError(statusCode.NOT_FOUND, "You can't Update User balance");
    }

    // Change Wallet Status
    if (ifUserExist && payload.status) {
        if (decodedToken.role === Role.ADMIN || decodedToken.role === Role.SUPER_ADMIN) {
            if (ifChangeUserExist) {
                ifChangeUserExist = await Wallet.findByIdAndUpdate(ifChangeUserExist.wallet, { status: payload.status }, { new: true, runValidators: true });
            }
        }
    }

    return ifChangeUserExist;
};

const cashOut = async (userEmail: string, payload: IPayload, decodedToken: JwtPayload) => {
    const session = await Wallet.startSession();
    session.startTransaction()
    try {
        if (payload.status) {
            throw new AppError(statusCode.NOT_FOUND, "You can't Update User Status");
        }
        if (payload.balance) {
            if (payload.balance < 1) {
                throw new AppError(statusCode.NOT_FOUND, "Wrong Information Collected!");
            }
        }

        const ifUserExist = await User.findById(decodedToken.userId).session(session).select("-password").populate({
            path: "wallet",
            select: "balance status"
        });
        if (!ifUserExist) {
            throw new AppError(statusCode.NOT_FOUND, "User Not Found!");
        }
        if (ifUserExist) {
            if (ifUserExist.role !== Role.USER) {
                throw new AppError(statusCode.BAD_REQUEST, "You can not make cash out");
            }

            const userWallet = await Wallet.findById(ifUserExist.wallet).session(session);
            if (userWallet?.status !== WalletStatus.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "User Account is Blocked");
            }
            if (userWallet?.balance && payload?.balance) {
                const { balance } = payload;
                const balanceWithFee = balance + (balance * 1.8 / 100);
                if (userWallet.balance < 0 || userWallet.balance < balanceWithFee) {
                    throw new AppError(statusCode.BAD_REQUEST, "Insufficient Balance!");
                }
                if ((userWallet.balance - balanceWithFee) < 0) {
                    throw new AppError(statusCode.BAD_REQUEST, "Something Went Wrong!");
                }
                await Wallet.findByIdAndUpdate(userWallet._id, { balance: (userWallet?.balance - balanceWithFee) }, { new: true, runValidators: true, session });
            }
        }

        const ifSendUserExist = await User.findOne({ email: userEmail }).session(session);
        if (!ifSendUserExist) {
            throw new AppError(statusCode.NOT_FOUND, "Sender Not Found!");
        }

        // Send Balance Handle
        if (ifSendUserExist) {
            if (ifSendUserExist.role !== Role.AGENT) {
                throw new AppError(statusCode.BAD_REQUEST, "Sender not agent");
            }
            if (!ifSendUserExist.isVerified) {
                throw new AppError(statusCode.NOT_FOUND, "Sender is Not Verified!");
            }
            if (ifSendUserExist.isActive !== IsActive.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Sender is Not Active!");
            }

            const sendUserWallet = await Wallet.findById(ifSendUserExist.wallet).session(session);
            if (sendUserWallet?.status !== WalletStatus.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Sender Account is Blocked");
            }

            if (sendUserWallet?.balance && payload?.balance) {
                const { balance } = payload;
                if (sendUserWallet.balance < 0) {
                    throw new AppError(statusCode.BAD_REQUEST, "Something Went Wrong!");
                }
                const balanceWithCommission = balance + (balance * 0.4 / 100);
                await Wallet.findByIdAndUpdate(sendUserWallet._id, { balance: (sendUserWallet?.balance + balanceWithCommission) }, { new: true, runValidators: true, session });
            }
        }

        // Create Transaction for From
        await Transaction.create([{
            user: ifUserExist?._id,
            amount: payload.balance,
            type: TransactionType.CASH_OUT,
            transactionId: getTransactionId(),
            transactionWith: ifSendUserExist._id,
            fee: (payload.balance as number) * 1.8 / 100,
        }], { session });

        // Create Transaction for To
        await Transaction.create([{
            user: ifSendUserExist._id,
            amount: payload.balance,
            type: TransactionType.CASH_OUT,
            transactionId: getTransactionId(),
            transactionWith: ifUserExist?._id,
            commission: (payload.balance as number) * 0.4 / 100,
        }], { session });

        const updateUser = await User.findById(decodedToken.userId).session(session).select("-password").populate({
            path: "wallet",
            select: "balance status"
        });

        await session.commitTransaction();
        session.endSession();
        return updateUser;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const cashIn = async (userEmail: string, payload: IPayload, decodedToken: JwtPayload) => {
    const session = await Wallet.startSession();
    session.startTransaction()
    try {
        if (payload.status) {
            throw new AppError(statusCode.NOT_FOUND, "You can't Update User Status");
        }
        if (payload.balance) {
            if (payload.balance < 1) {
                throw new AppError(statusCode.NOT_FOUND, "Wrong Information Collected!");
            }
        }

        const ifUserExist = await User.findById(decodedToken.userId).session(session).select("-password").populate({
            path: "wallet",
            select: "balance status"
        });
        if (!ifUserExist) {
            throw new AppError(statusCode.NOT_FOUND, "Agent Not Found!");
        }
        if (ifUserExist) {
            if (ifUserExist.role !== Role.AGENT) {
                throw new AppError(statusCode.BAD_REQUEST, "You can not make cash in");
            }

            const userWallet = await Wallet.findById(ifUserExist.wallet).session(session);
            if (userWallet?.status !== WalletStatus.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Agent Account is Blocked");
            }
            if (userWallet?.balance && payload?.balance) {
                const { balance } = payload;
                if (userWallet.balance < 0 || userWallet.balance < balance) {
                    throw new AppError(statusCode.BAD_REQUEST, "Insufficient Balance!");
                }
                if ((userWallet.balance - balance) < 0) {
                    throw new AppError(statusCode.BAD_REQUEST, "Something Went Wrong!");
                }
                await Wallet.findByIdAndUpdate(userWallet._id, { balance: (userWallet?.balance - balance) }, { new: true, runValidators: true, session });
            }
        }

        const ifSendUserExist = await User.findOne({ email: userEmail }).session(session);
        if (!ifSendUserExist) {
            throw new AppError(statusCode.NOT_FOUND, "Sender Not Found!");
        }

        // Send Balance Handle
        if (ifSendUserExist) {
            if (ifSendUserExist.role !== Role.USER) {
                throw new AppError(statusCode.BAD_REQUEST, "Sender not user");
            }
            if (!ifSendUserExist.isVerified) {
                throw new AppError(statusCode.NOT_FOUND, "Sender is Not Verified!");
            }
            if (ifSendUserExist.isActive !== IsActive.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Sender is Not Active!");
            }

            const sendUserWallet = await Wallet.findById(ifSendUserExist.wallet).session(session);
            if (sendUserWallet?.status !== WalletStatus.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Sender Account is Blocked");
            }

            if (sendUserWallet?.balance && payload?.balance) {
                const { balance } = payload;
                if (sendUserWallet.balance < 0) {
                    throw new AppError(statusCode.BAD_REQUEST, "Something Went Wrong!");
                }

                await Wallet.findByIdAndUpdate(sendUserWallet._id, { balance: (sendUserWallet?.balance + balance) }, { new: true, runValidators: true, session });
            }
        }

        // Create Transaction for From
        await Transaction.create([{
            user: ifUserExist?._id,
            amount: payload.balance,
            type: TransactionType.CASH_IN,
            transactionId: getTransactionId(),
            transactionWith: ifSendUserExist._id,
            fee: 0,
        }], { session });

        // Create Transaction for To
        await Transaction.create([{
            user: ifSendUserExist._id,
            amount: payload.balance,
            type: TransactionType.CASH_IN,
            transactionId: getTransactionId(),
            transactionWith: ifUserExist?._id,
            commission: 0,
        }], { session });

        const updateUser = await User.findById(decodedToken.userId).session(session).select("-password").populate({
            path: "wallet",
            select: "balance status"
        });

        await session.commitTransaction();
        session.endSession();

        return updateUser;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const sendMoney = async (userEmail: string, payload: IPayload, decodedToken: JwtPayload) => {
    const session = await Wallet.startSession();
    session.startTransaction()
    try {
        if (payload.status) {
            throw new AppError(statusCode.NOT_FOUND, "You can't Update User Status");
        }
        if (payload.balance) {
            if (payload.balance < 1) {
                throw new AppError(statusCode.NOT_FOUND, "Wrong Information Collected!");
            }
        }

        const ifUserExist = await User.findById(decodedToken.userId).session(session).select("-password").populate({
            path: "wallet",
            select: "balance status"
        });
        if (!ifUserExist) {
            throw new AppError(statusCode.NOT_FOUND, "User Not Found!");
        }
        if (ifUserExist) {
            if (ifUserExist.role !== Role.USER) {
                throw new AppError(statusCode.BAD_REQUEST, "You can not make cash in");
            }

            const userWallet = await Wallet.findById(ifUserExist.wallet).session(session);
            if (userWallet?.status !== WalletStatus.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "User Account is Blocked");
            }
            if (userWallet?.balance && payload?.balance) {
                const { balance } = payload;
                const balanceWithFee = balance + (balance * 0.5 / 100);
                if (userWallet.balance < 0 || userWallet.balance < balanceWithFee) {
                    throw new AppError(statusCode.BAD_REQUEST, "Insufficient Balance!");
                }
                if ((userWallet.balance - balanceWithFee) < 0) {
                    throw new AppError(statusCode.BAD_REQUEST, "Something Went Wrong!");
                }
                await Wallet.findByIdAndUpdate(userWallet._id, { balance: (userWallet?.balance - balanceWithFee) }, { new: true, runValidators: true, session });
            }
        }

        const ifSendUserExist = await User.findOne({ email: userEmail }).session(session);
        if (!ifSendUserExist) {
            throw new AppError(statusCode.NOT_FOUND, "Sender Not Found!");
        }
        // If User send to own
        if (ifUserExist._id.toString() === ifSendUserExist._id.toString()) {
            throw new AppError(statusCode.BAD_REQUEST, "User and Sender Are Same!");
        }

        // Send Balance Handle
        if (ifSendUserExist) {
            if (ifSendUserExist.role !== Role.USER) {
                throw new AppError(statusCode.BAD_REQUEST, "Sender not user");
            }
            if (!ifSendUserExist.isVerified) {
                throw new AppError(statusCode.NOT_FOUND, "Sender is Not Verified!");
            }
            if (ifSendUserExist.isActive !== IsActive.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Sender is Not Active!");
            }

            const sendUserWallet = await Wallet.findById(ifSendUserExist.wallet).session(session);
            if (sendUserWallet?.status !== WalletStatus.ACTIVE) {
                throw new AppError(statusCode.NOT_FOUND, "Sender Account is Blocked");
            }

            if (sendUserWallet?.balance && payload?.balance) {
                const { balance } = payload;
                if (sendUserWallet.balance < 0) {
                    throw new AppError(statusCode.BAD_REQUEST, "Something Went Wrong!");
                }

                await Wallet.findByIdAndUpdate(sendUserWallet._id, { balance: (sendUserWallet?.balance + balance) }, { new: true, runValidators: true, session });
            }
        }

        // Create Transaction for From
        await Transaction.create([{
            user: ifUserExist?._id,
            amount: payload.balance,
            type: TransactionType.SEND_MONEY,
            transactionId: getTransactionId(),
            transactionWith: ifSendUserExist._id,
            fee: (payload.balance as number) * 0.5 / 100,
        }], { session });

        // Create Transaction for To
        await Transaction.create([{
            user: ifSendUserExist._id,
            amount: payload.balance,
            type: TransactionType.RECEIVE_MONEY,
            transactionId: getTransactionId(),
            transactionWith: ifUserExist?._id,
            fee: 0,
        }], { session });

        const updateUser = await User.findById(decodedToken.userId).session(session).select("-password").populate({
            path: "wallet",
            select: "balance status"
        });

        await session.commitTransaction();
        session.endSession();

        return updateUser;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const WalletService = {
    updateWallet,
    cashOut,
    cashIn,
    sendMoney
}