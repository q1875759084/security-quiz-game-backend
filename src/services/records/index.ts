import { getRecord, upsertRecord } from '../../database/records'

class RecordService {
    getRecord(userId: number, scriptId: string) {
        const record = getRecord(userId, scriptId)
        if (!record) return null    // 如果查表没有存档，则返回null
        let history: any[];
        try {
            history = JSON.parse(record.history);
        } catch {
            // record.history 字段损坏，降级返回空数组
            history = [];
        }

        return {
            id: record.id,
            scriptId: record.script_id,
            currentNodeId: record.current_node_id,
            history,
            status: record.status,
            updatedAt: record.updated_at,  // 注意：你写的是 updateAt，少了个 d
        };
    }
    upsertRecord(userId: number, scriptId: string, currentNodeId: string, history: Array<any>, status: number) {
        const historyStr = JSON.stringify(history)

        const result = upsertRecord({
            userId,
            scriptId,
            currentNodeId,
            history: historyStr,
            status: status,
        })
        return { id: result.lastInsertRowid }
    }
}

export default new RecordService()