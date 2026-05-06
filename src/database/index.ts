import sqlite from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径：放在独立的 database/ 目录，便于 Docker Volume 挂载
// 用 __dirname 而非 process.cwd()，避免因启动目录不同导致路径漂移
const dbPath = path.resolve(__dirname, '../../database/database.sqlite3');

// better-sqlite3 不会自动创建父目录，目录不存在时直接报错
// 容器首次启动时 Volume 挂载点为空目录，需要确保目录存在
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// 导出唯一数据库实例
export const db = sqlite(dbPath);

console.log('✅ SQLite 数据库连接成功');