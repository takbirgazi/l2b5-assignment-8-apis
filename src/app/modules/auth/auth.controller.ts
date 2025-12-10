import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import statusCode from "http-status-codes";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthService } from "./auth.service";
import { envVars } from "../../config/env";

const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
            return next(new AppError(statusCode.FORBIDDEN, err));
        }
        if (!user) {
            return next(new AppError(statusCode.NOT_FOUND, info.message));
        }
        const userToken = await createUserTokens(user);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: noPass, ...rest } = user.toObject();

        // Set Cookies
        setAuthCookie(res, userToken);

        sendResponse(res, {
            statusCode: statusCode.OK,
            success: true,
            message: "Log In Successfully!",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        })
    })(req, res, next)
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(statusCode.BAD_REQUEST, "No Refresh token get from cookies!")
    }
    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "Get Token Successfully!",
        data: tokenInfo
    })
});

const logOut = catchAsync(async (req: Request, res: Response) => {

    // destroy cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true // For Google Chrome
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true // For Google Chrome
    });

    sendResponse(res, {
        statusCode: statusCode.OK,
        success: true,
        message: "Log Out Successfully!",
        data: null
    })
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
    let redirectTo = req.query.state ? req.query.state as string : "";
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError(statusCode.NOT_FOUND, "User Not Found");
    };

    const tokenInfo = createUserTokens(user);
    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
});

export const AuthControllers = {
    credentialLogin,
    getNewAccessToken,
    googleCallback,
    logOut,
}