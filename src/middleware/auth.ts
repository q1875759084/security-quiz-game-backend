import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// 扩展 TS 类型：给 req 挂载 userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. 从请求头拿 token：Bearer xxx
  const authStr = req.headers.authorization;
  if (!authStr || !authStr.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录，Token 缺失' });
  }

  const token = authStr.split(' ')[1];
  try {
    // 2. 校验并解析 token
    const payload = verifyToken(token) as { userId: number };
    // 3. 挂载到请求上下文，后续 Controller/Service 直接用
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token 无效或已过期' });
  }
};