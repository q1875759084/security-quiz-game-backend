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

// 配置跨域白名单，支持多域名，逗号分隔：如 "https://a.com,https://b.com"
// 未配置时默认空列表，跨域请求全拒（安全默认值）
// 同域部署（nginx 反代 /api/*）时浏览器不触发 CORS，空列表不影响功能
// 增加白名单只需修改 Secrets 并重新触发部署，无需改代码或重新构建镜像
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];
app.use(cors({
  origin: corsOrigins,
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