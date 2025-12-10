import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import passport from "passport";


const router = Router();

router.post("/login", AuthControllers.credentialLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logOut);

router.get("/google", async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", { scope: ["profile", "email"], state: redirect as string })(req, res, next)
});
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), AuthControllers.googleCallback);


export const AuthRouters = router;