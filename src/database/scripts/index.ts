import { db } from '../index';

/** 初始化 scripts 表（剧本元数据） */
export function initScriptsTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS scripts (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      description   TEXT,
      cover_color   TEXT,
      tags          TEXT,
      chapter_count  INTEGER DEFAULT 1,
      entry_node_id TEXT,
      status         TINYINT DEFAULT 1,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  console.log('✅ scripts 表初始化完成');
}

/** 初始化 script_nodes 表（剧本节点，choices 存 JSON 字符串） */
export function initScriptNodesTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS script_nodes (
      id         TEXT PRIMARY KEY,
      script_id  TEXT NOT NULL,
      title      TEXT NOT NULL,
      content    TEXT NOT NULL,
      type       TEXT NOT NULL,
      choices    TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (script_id) REFERENCES scripts(id)
    )
  `).run();
  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_script_nodes_script_id
    ON script_nodes(script_id)
  `).run();
  console.log('✅ script_nodes 表初始化完成');
}

export interface ScriptNodeRow {
  id: string;
  script_id: string;
  title: string;
  content: string;
  type: string;
  choices: string; // 数据库中存储为 JSON 字符串
}

/**
 * 查询单个剧本节点
 * @param scriptId 剧本 ID
 * @param nodeId 节点 ID
 */
export function queryNode(scriptId: string, nodeId: string): ScriptNodeRow | null {
  return db.prepare(`
    SELECT id, script_id, title, content, type, choices
    FROM script_nodes
    WHERE script_id = ? AND id = ?
  `).get(scriptId, nodeId) as ScriptNodeRow | null;
}

export interface ScriptRow {
  id: string;
  title: string;
  description: string | null;
  cover_color: string | null;
  tags: string | null; // 数据库中存储为 JSON 字符串，如 '["零式","固定队"]'
  chapter_count: number;
  entry_node_id: string | null;
}

/**
 * 查询上架剧本列表
 * @param keyword 标题模糊匹配，不传时返回全量
 */
export function queryScripts(keyword?: string): ScriptRow[] {
  if (keyword) {
    return db.prepare(`
      SELECT id, title, description, cover_color, tags, chapter_count, entry_node_id
      FROM scripts
      WHERE status = 1 AND title LIKE ?
      ORDER BY created_at DESC
    `).all(`%${keyword}%`) as ScriptRow[];
  }
  return db.prepare(`
    SELECT id, title, description, cover_color, tags, chapter_count, entry_node_id
    FROM scripts
    WHERE status = 1
    ORDER BY created_at DESC
  `).all() as ScriptRow[];
}
