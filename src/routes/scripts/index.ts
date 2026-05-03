import { Router } from "express";
import ScriptsController from "../../controllers/scripts";

const router = Router();

router.get('/', ScriptsController.getScripts);
router.get('/:scriptId/nodes/:nodeId', ScriptsController.getNodes);

export default router;