import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { generateToken, verifyToken } from "./jwt";
import AppError from "../errorHelpers/AppError";
import statusCode from "http-status-codes";
import { User } from "../modules/user/user.model";
import { IsActive, IUser } from "../modules/user/user.interface";

export const createUserTokens = (user: Partial<IUser>) => {

    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);
    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

    return {
        accessToken,
        refreshToken
    }
};

export const newAccessTokenByRefreshToken = async (refreshToken: string) => {
    const verifiedToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

    const isExistUser = await User.findOne({ email: verifiedToken.email });

    if (!isExistUser) {
        throw new AppError(statusCode.BAD_REQUEST, "User doesn't Exist!");
    }
    if (isExistUser.isActive === IsActive.BLOCKED || isExistUser.isActive === IsActive.INACTIVE) {
        throw new AppError(statusCode.BAD_REQUEST, `User is ${isExistUser.isActive}`);
    }
    if (isExistUser.isDeleted) {
        throw new AppError(statusCode.BAD_REQUEST, "User is deleted");
    }

    const jwtPayload = {
        userId: isExistUser._id,
        email: isExistUser.email,
        role: isExistUser.role,
    };

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    return accessToken
}