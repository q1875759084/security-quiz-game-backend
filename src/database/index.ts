import sqlite from 'better-sqlite3';
import path from 'path';

// 数据库文件路径（根目录）
const dbPath = path.resolve(process.cwd(), 'database.sqlite3');

// 导出唯一数据库实例
export const db = sqlite(dbPath);

console.log('✅ SQLite 数据库连接成功');