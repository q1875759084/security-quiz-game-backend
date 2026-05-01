import express, { Request, Response } from "express";
import {initUserTable} from "./database/user";
import routes from "./routes/index";
import xssMiddleware from "./middleware/xssMiddleware";
import cookieParser from "cookie-parser";
import cors from "cors"; // 新增, 跨域中间件
// TODO: 导入错误处理中间件
// import { errorHandler } from "./src/middleware/errorHandler";

initUserTable();initUserTable();

const app = express();
const port = 3000;

// 配置跨域
app.use(cors({
  origin: 'http://localhost:3001', // 前端地址
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