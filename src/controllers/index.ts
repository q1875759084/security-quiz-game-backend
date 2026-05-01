/**
 * Controller 只做 3 件事：
 * 1. 接收请求参数
 * 2. 调用 Service 层
 * 3. 返回统一格式响应
 * 注意： 绝不写业务逻辑、绝不操作数据库
 */


// 控制器层聚合导出
// 示例：
// export { default as UserController } from './user';
// export { default as QuizController } from './quiz';