import {Router, Request, Response} from 'express'

const router = Router();

router.post('/register', (req: Request, res: Response) => {
    // 注册逻辑
})

router.post('/login', (req: Request, res: Response) => {
    // 登录逻辑
})

router.get('/info', (req: Request, res: Response) => {
    // 获取用户信息逻辑
})

export default router;