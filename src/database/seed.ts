/**
 * 数据库 Seed 脚本
 * 用途：插入开发环境初始数据
 * 执行：npm run seed
 * 注意：仅允许在 development 环境运行，生产环境会直接退出
 */

import path from 'path';
import fs from 'fs';
import { db } from './index';
import { initScriptsTable, initScriptNodesTable } from './scripts';

// 环境保护：非开发环境禁止执行
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seed 脚本不允许在生产环境运行');
  process.exit(1);
}

// 确保表已存在
initScriptsTable();
initScriptNodesTable();

// ─── 初始剧本数据 ─────────────────────────────────────────────────────────────
const SEED_SCRIPTS = [
  {
    id: 'capture1',
    title: '我们仍未知道那天在边狱所看到的固定队的名字',
    description: '一切从一支固定队开始。骰子将决定你们的故事走向……',
    cover_color: '#1a3a5c',
    tags: JSON.stringify(['零式', '固定队', '剧情']),
    chapter_count: 1,
    entry_node_id: 'chapter1_node2',
    status: 1,
  },
  {
    id: 'capture2',
    title: '安科：暗潮',
    description: '固定队内部矛盾渐起，信任正在悄然瓦解。',
    cover_color: '#3a1a2c',
    tags: JSON.stringify(['团队', '冲突']),
    chapter_count: 2,
    entry_node_id: null,
    status: 1,
  },
  {
    id: 'capture3',
    title: '安科：终局',
    description: '最终决战前夕，每一个选择都将改变结局。',
    cover_color: '#1a2e1a',
    tags: JSON.stringify(['终局', '多结局']),
    chapter_count: 3,
    entry_node_id: null,
    status: 1,
  },
];

// INSERT OR IGNORE：主键已存在时跳过，保证幂等性
const insert = db.prepare(`
  INSERT OR IGNORE INTO scripts (id, title, description, cover_color, tags, chapter_count, entry_node_id, status)
  VALUES (@id, @title, @description, @cover_color, @tags, @chapter_count, @entry_node_id, @status)
`);

// 使用事务批量插入，保证原子性
const insertMany = db.transaction((scripts: typeof SEED_SCRIPTS) => {
  for (const script of scripts) {
    insert.run(script);
  }
});

insertMany(SEED_SCRIPTS);
console.log(`✅ scripts Seed 完成，共处理 ${SEED_SCRIPTS.length} 条剧本数据`);

// ─── 剧本节点数据 ─────────────────────────────────────────────────────────────
// 映射：剧本 ID → 对应的节点 JSON 文件路径
const NODE_FILES: { scriptId: string; filePath: string }[] = [
  {
    scriptId: 'capture1',
    filePath: path.resolve(__dirname, '../data/chapter1.json'),
  },
];

interface NodeJson {
  id: string;
  title: string;
  content: string;
  type: string;
  choices: unknown[];
}

const insertNode = db.prepare(`
  INSERT OR IGNORE INTO script_nodes (id, script_id, title, content, type, choices)
  VALUES (@id, @script_id, @title, @content, @type, @choices)
`);

const insertNodes = db.transaction((scriptId: string, nodes: NodeJson[]) => {
  for (const node of nodes) {
    insertNode.run({
      id: node.id,
      script_id: scriptId,
      title: node.title,
      content: node.content,
      type: node.type,
      choices: JSON.stringify(node.choices), // 数组序列化为 JSON 字符串存储
    });
  }
});

for (const { scriptId, filePath } of NODE_FILES) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  节点文件不存在，跳过: ${filePath}`);
    continue;
  }
  const nodes: NodeJson[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  insertNodes(scriptId, nodes);
  console.log(`✅ script_nodes Seed 完成：${scriptId}，共 ${nodes.length} 个节点`);
}
