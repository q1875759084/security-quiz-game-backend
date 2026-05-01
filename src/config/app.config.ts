// 应用配置文件
// 此文件用于集中管理系统配置参数

// TODO: 实现以下配置：
// - 应用名称
// - 应用版本
// - 端口号（可从环境变量获取）
// - 日志级别
// - 跨域配置
// - 安全配置

// 示例结构：
// export const appConfig = {
//   name: process.env.APP_NAME || 'Security Quiz Game',
//   version: process.env.APP_VERSION || '1.0.0',
//   port: parseInt(process.env.PORT || '3000'),
//   cors: { origin: process.env.CORS_ORIGIN || '*', credentials: true },
//   logLevel: process.env.LOG_LEVEL || 'info',
// };