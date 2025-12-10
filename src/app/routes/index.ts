import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { WalletRouters } from "../modules/wallet/wallet.route";
import { TransactionRouters } from "../modules/transaction/transaction.route";
import { AnalyticsRouter } from "../modules/analytics/analytics.route";


export const router = Router();

const moduleRoute = [
    {
        path: "/user",
        route: userRoutes
    },
    {
        path: "/auth",
        route: AuthRouters
    },
    {
        path: "/wallet",
        route: WalletRouters
    },
    {
        path: "/transaction",
        route: TransactionRouters
    },
    {
        path: "/analytics",
        route: AnalyticsRouter
    }
];

moduleRoute.forEach(route => {
    router.use(route.path, route.route);
})


/**
* https://no-cash.vercel.app/

Post Method---------------------
api/v1/user/register

Get Method----------------------
api/v1/user/me
api/v1/user/all-users
api/v1/user/:id

Patch Method---------------------
api/v1/user/:id

Post Method----------------------
api/v1/auth/login
api/v1/auth/refresh-token
api/v1/auth/logout

Get Method------------------------
api/v1/auth/google

Patch Method----------------------
api/v1/wallet/cash-out/:email
api/v1/wallet/cash-in/:email
api/v1/wallet/send-money/:email
api/v1/wallet/:email

Get Method-------------------------
api/v1/transaction/history
api/v1/transaction/all-history

*/