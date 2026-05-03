import { Request, Response } from "express";
import ScriptService from "../../services/scripts";
import { success, fail } from "../../utils/response";

class ScriptsController {
    async getScripts(req: Request, res: Response) {
        try {
            const raw = req.query.keyword;
            const keyword = typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
            const scripts = ScriptService.getScripts(keyword);
            success(res, scripts, "获取剧本信息成功");
        } catch (e: any) {
            fail(res, 500, e?.message || '服务器内部错误');
        }
    }

    async getNodes(req: Request, res: Response) {
        try {
            const { scriptId, nodeId } = req.params;
            const nodeData = ScriptService.getNodes(scriptId, nodeId);
            success(res, nodeData, "获取节点信息成功");
        } catch (e: any) {
            fail(res, 500, e?.message || '服务器内部错误');
        }
    }
}

export default new ScriptsController();
