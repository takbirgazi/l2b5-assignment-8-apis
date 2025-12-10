import AppError from "../../errorHelpers/AppError";
import statusCode from "http-status-codes";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { Wallet } from "../wallet/wallet.model";
import { WalletStatus } from "../wallet/wallet.interface";

const createUser = async (payload: Partial<IUser>) => {
    const session = await User.startSession();
    session.startTransaction();

    try {
        const { email, password, ...rest } = payload;

        // Check if user already exists
        const isExistUser = await User.findOne({ email }).session(session);
        if (isExistUser) {
            throw new AppError(statusCode.BAD_REQUEST, "User Already Exist");
        }

        // Create wallet for the user
        const wallet = await Wallet.create(
            [
                {
                    balance: Number(envVars.INITIAL_ACCOUNT_BALANCE),
                    status: WalletStatus.ACTIVE,
                },
            ],
            { session }
        );

        // Hash password
        const hashedPassword = await bcryptjs.hash(
            password as string,
            Number(envVars.BCRYPT_SALT_ROUND)
        );

        // Setup auth provider
        const authProvider: IAuthProvider = {
            provider: "credential",
            providerId: email as string,
        };

        // Create user
        const user = await User.create(
            [
                {
                    email,
                    password: hashedPassword,
                    auths: [authProvider],
                    wallet: wallet[0]._id,
                    ...rest,
                },
            ],
            { session }
        );

        // Link wallet to user
        await Wallet.findByIdAndUpdate(
            wallet[0]._id,
            { userId: user[0]._id },
            { new: true, runValidators: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        return user;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};


const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
        if (userId !== decodedToken.userId) {
            throw new AppError(statusCode.FORBIDDEN, "You are not authorize!");
        }
    }

    const ifUserExist = await User.findById(userId);
    if (!ifUserExist) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found!");
    }

    if (decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(statusCode.FORBIDDEN, "You are not authorize!");
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(statusCode.FORBIDDEN, "You are not authorize!");
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
            throw new AppError(statusCode.FORBIDDEN, "You are not authorize!");
        }
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return newUpdateUser;
};

const getAllUser = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(
        User.find().select("-password").populate({
            path: "wallet",
            select: "balance status"
        }),
        query
    );

    const totalUserData = queryBuilder
        .paginate()
        .search(userSearchableFields)

    const [data, meta] = await Promise.all([
        totalUserData.build(),
        queryBuilder.getMeta()
    ])
    return {
        data,
        meta
    }
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId)
        .select("-password")
        .populate({
            path: "wallet",
            select: "balance status"
        });

    return {
        data: user
    };
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};

export const UserService = {
    createUser,
    getAllUser,
    updateUser,
    getMe,
    getSingleUser,
}