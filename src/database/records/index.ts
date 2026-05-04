import { db } from '..';

// 数据库原始行类型
export interface RecordRow {
  id: number;
  user_id: number;
  script_id: string;
  current_node_id: string;
  history: string; // JSON 字符串，序列化的历史记录数组
  status: number;  // 1进行中 / 2已完成
  created_at: string;
  updated_at: string;
}

/**
 * 初始化 records 表
 * UNIQUE(user_id, script_id)：同一用户同一剧本只保留一条存档
 */
export function initRecordsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS records (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL,
      script_id       TEXT    NOT NULL,
      current_node_id TEXT    NOT NULL,
      history         TEXT    NOT NULL DEFAULT '[]',
      status          TINYINT NOT NULL DEFAULT 1,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, script_id)
    )
  `).run();
  console.log('✅ records 表初始化完成');
}

/**
 * 查询存档（单条）
 * @param userId   当前登录用户 ID（来自 JWT）
 * @param scriptId 剧本 ID
 */
export function getRecord(
  userId: number,
  scriptId: string,
): RecordRow | undefined {
  return db
    .prepare(
      `SELECT * FROM records WHERE user_id = ? AND script_id = ?`,
    )
    .get(userId, scriptId) as RecordRow | undefined;
}

/**
 * 创建或更新存档（upsert）
 * 同一用户同一剧本触发 ON CONFLICT，改为 UPDATE
 */
export function upsertRecord(data: {
  userId: number;
  scriptId: string;
  currentNodeId: string;
  history: string; // 已序列化的 JSON 字符串
  status: number;
}) {
  return db
    .prepare(
      `INSERT INTO records (user_id, script_id, current_node_id, history, status, updated_at)
       VALUES (@userId, @scriptId, @currentNodeId, @history, @status, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, script_id) DO UPDATE SET
         current_node_id = excluded.current_node_id,
         history         = excluded.history,
         status          = excluded.status,
         updated_at      = CURRENT_TIMESTAMP`,
    )
    .run(data);
}