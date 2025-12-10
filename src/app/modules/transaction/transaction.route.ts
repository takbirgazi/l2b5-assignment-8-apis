import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";



const router = Router();

router.get("/history", checkAuth(Role.USER, Role.AGENT), TransactionController.getTransactionHistory);
router.get("/all-history", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TransactionController.getAllTransactionHistory);

export const TransactionRouters = router;