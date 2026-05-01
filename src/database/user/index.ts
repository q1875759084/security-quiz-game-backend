import { db } from '../index';

// 1. 初始化 users 表（仅 user 相关）
export function initUserTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      status TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME CURRENT_TIMESTAMP
    )
  `).run();
  console.log('✅ users 表初始化完成');
}

// 2. 根据用户名/邮箱/手机号查询用户（登录专用）
export function findUserByAccount(account: string) {
  return db.prepare(`
    SELECT * FROM users 
    WHERE username = ? OR email = ? OR phone = ?
  `).get(account, account, account);
}

// 3. 根据ID查询用户（获取信息专用）
export function findUserById(userId: number) {
  return db.prepare(`
    SELECT id, username, email, phone, nickname, avatar, created_at
    FROM users WHERE id = ?
  `).get(userId);
}

// 4. 创建用户（注册专用）
export function createUser(user: {
  username: string;
  password_hash: string;
  email?: string | null;
  phone?: string | null;
  nickname?: string | null;
}) {
  return db.prepare(`
    INSERT INTO users (username, password_hash, email, phone, nickname)
    VALUES (@username, @password_hash, @email, @phone, @nickname)
  `).run(user);
}

// 5. 检查用户名/邮箱/手机号是否重复
export function checkUserExists(field: string, value: string) {
  return db.prepare(`SELECT 1 FROM users WHERE ${field} = ?`).get(value);
}

/**
 * 根据字段查询用户
 */
export function getUserByField(field: string | number, value: string | number) {
  return db.prepare(`SELECT * FROM users WHERE ${field} = ?`).get(value);
}