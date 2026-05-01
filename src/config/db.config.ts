// 数据库配置文件
// 此文件用于集中管理数据库连接配置

// TODO: 实现以下配置：
// - MongoDB 连接字符串
// - 连接池配置
// - 重试次数
// - 超时时间

// 示例结构：
// export const dbConfig = {
//   uri: process.env.DB_URI || 'mongodb://localhost:27017/security_quiz_game',
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
//   reconnectTries: parseInt(process.env.DB_RECONNECT_TRIES || '30'),
//   reconnectInterval: parseInt(process.env.DB_RECONNECT_INTERVAL || '1000'),
// };