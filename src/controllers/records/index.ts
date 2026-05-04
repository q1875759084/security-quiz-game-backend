import { Request, Response } from 'express'
import RecordService from "../../services/records"
import { success, fail } from "../../utils/response"

class RecordController {
  getRecord(req: Request, res: Response) {
    try {
      const userId = req.userId // 来自 authMiddleware，无需校验
      const { scriptId } = req.query // 来自url，这部分需要校验
      if (!scriptId || typeof scriptId !== 'string') {
        return fail(res, 400, 'scriptId is required')
      }
      const record = RecordService.getRecord(userId, scriptId)
      return success(res, record, '获取历史记录成功')
    } catch (e) {
      console.error(e)
      fail(res, 500, 'Internal Server Error')
    }
  }

  upsertRecord(req: Request, res: Response) {
    try {
      const userId = req.userId // 来自 authMiddleware，无需校验
      const { scriptId, currentNodeId, history, status = 1 } = req.body

      // 参数校验：逐字段收集错误，一次性返回所有缺失项
      const errors: string[] = [
        (!scriptId || typeof scriptId !== 'string') && 'scriptId is required',
        (!currentNodeId || typeof currentNodeId !== 'string') && 'currentNodeId is required',
        (!Array.isArray(history)) && 'history must be an array',
        (status !== undefined && ![1, 2].includes(status)) && 'status must be 1 or 2',
      ].filter(Boolean) as string[]

      if (errors.length) {
        return fail(res, 400, errors.join('; '))
      }

      // record 返回的是存档 id，前端通常无感知
      const data = RecordService.upsertRecord(userId, scriptId, currentNodeId, history, status)
      return success(res, data, '更新历史记录成功')
    } catch (e) {
      console.error(e)
      fail(res, 500, 'Internal Server Error')
    }
  }
}

export default new RecordController()
