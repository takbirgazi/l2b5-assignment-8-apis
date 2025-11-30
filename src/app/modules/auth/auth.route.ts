import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.get("/login", AuthControllers.login)
// router.post("/logout", AuthControllers.logOut)
// router.post("/refresh-token", AuthControllers.getNewAccessToken);

export const authRoutes = router;