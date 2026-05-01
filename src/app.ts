import express, { Request, Response } from "express";
import routes from "./routes/index";
import xssMiddleware from "./middleware/xssMiddleware";
// TODO: 导入错误处理中间件
// import { errorHandler } from "./src/middleware/errorHandler";

const app = express();
const port = 3000;

// 全局中间件
app.use(xssMiddleware);
// TODO: 添加全局错误处理中间件
// app.use(errorHandler);

// 统一注册所有路由，前缀/api
app.use('/api', routes)

// 兜底
app.get('/', (req: Request, res: Response) => {
    res.send('Routes index');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});