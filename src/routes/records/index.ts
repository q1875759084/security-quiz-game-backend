import { Router } from "express";
import RecordsController from "../../controllers/records";
import { authMiddleware } from "../../middleware/auth";

const router = Router();
router.get("/", authMiddleware, RecordsController.getRecord);
router.post("/", authMiddleware, RecordsController.upsertRecord);

export default router;