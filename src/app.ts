import 'dotenv/config'; // 本地开发：从 .env 文件加载环境变量；生产环境变量由 compose 注入，此行无副作用
import express, { Request, Response } from "express";
import {initUserTable} from "./database/user";
import { initScriptsTable, initScriptNodesTable } from "./database/scripts";
import { initRecordsTable } from "./database/records";
import { seedDatabase } from "./database/seed";
import routes from "./routes/index";
import xssMiddleware from "./middleware/xssMiddleware";
import cookieParser from "cookie-parser";
import cors from "cors";
// TODO: 导入错误处理中间件
// import { errorHandler } from "./src/middleware/errorHandler";

// ─── 数据库初始化（启动时自动执行，幂等）────────────────────────────────────
// 顺序：建表 → seed 数据，seed 依赖表已存在
initUserTable();
initScriptsTable();
initScriptNodesTable();
initRecordsTable();
seedDatabase();

const app = express();
const port = Number(process.env.PORT) || 3000;

// 配置跨域，CORS_ORIGIN 必须通过环境变量注入，未配置时拒绝启动（Fail Fast）
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  throw new Error('CORS_ORIGIN 环境变量未配置，应用拒绝启动');
}
app.use(cors({
  origin: corsOrigin,
  credentials: true, // 允许携带 Cookie
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(cookieParser()); // 注册解析Cookie中间件
app.use(express.json()); // 注册解析JSON请求体中间件
// 全局中间件
app.use(xssMiddleware);
// TODO: 添加全局错误处理中间件
// app.use(errorHandler);

// 统一注册所有路由，前缀/api
app.use('/api', routes)

// 兜底
app.get('/', (req: Request, res: Response) => {
    res.send(new Date().toISOString());
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});