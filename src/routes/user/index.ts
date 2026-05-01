import { Router, Request, Response } from "express";
import UserController from "../../controllers/user";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/refresh", UserController.refresh);
// 需要鉴权才能访问的路由
router.get("/profile", authMiddleware, UserController.getProfile);
router.post("/logout", authMiddleware, UserController.logout);

export default router;
