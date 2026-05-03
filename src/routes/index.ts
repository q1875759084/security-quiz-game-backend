import { Router, Request, Response } from 'express';
import userRouter from './user/index';
import scriptsRouter from './scripts/index';

const router = Router();

// 注册所有路由模块
router.use('/user', userRouter);
router.use('/scripts', scriptsRouter);

// 兜底路由 - 处理未匹配的路径
router.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'API 路径不存在',
        suggestion: '请检查请求路径是否正确'
    });
});

export default router;