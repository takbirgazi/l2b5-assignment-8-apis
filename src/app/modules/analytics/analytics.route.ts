import { Router } from "express";
import { SummeryController } from "./analytics.controller";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";



const router = Router();

router.get("/summery", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SummeryController.getAllSummery);
router.get("/transfer-money", checkAuth(...Object.values(Role)), SummeryController.getTransactionSummary);
router.get("/transition-summery", checkAuth(...Object.values(Role)), SummeryController.getTransactionSummaryByDay);


export const AnalyticsRouter = router;