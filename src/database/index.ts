import sqlite from 'better-sqlite3';
import path from 'path';

// 数据库文件路径：固定在项目根目录（dist/../ 即项目根）
// 用 __dirname 而非 process.cwd()，避免因启动目录不同导致路径漂移
const dbPath = path.resolve(__dirname, '../../database.sqlite3');

// 导出唯一数据库实例
export const db = sqlite(dbPath);

console.log('✅ SQLite 数据库连接成功');