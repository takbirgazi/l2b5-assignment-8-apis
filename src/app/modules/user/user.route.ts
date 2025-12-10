import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createZodSchema, updateZodSchema } from "./user.validation";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";


const router = Router();

router.post("/register", validateRequest(createZodSchema), UserControllers.createUser);
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUser);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser);
router.patch("/:id", validateRequest(updateZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser);



export const userRoutes = router;