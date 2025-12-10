import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateWalletZodSchema } from "./wallet.validation";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";



const router = Router();

router.patch("/cash-out/:email", checkAuth(Role.USER), validateRequest(updateWalletZodSchema), WalletController.cashOut);
router.patch("/cash-in/:email", checkAuth(Role.AGENT), validateRequest(updateWalletZodSchema), WalletController.cashIn);
router.patch("/send-money/:email", checkAuth(Role.USER), validateRequest(updateWalletZodSchema), WalletController.sendMoney);
router.patch("/:email", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateWalletZodSchema), WalletController.updateWallet);

export const WalletRouters = router;