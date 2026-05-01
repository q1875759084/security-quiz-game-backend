import { Response } from 'express';

// 成功响应
export function success(res: Response, data?: unknown, message = '操作成功') {
  res.json({
    code: 200,
    message,
    data: data ?? null
  });
}

// 失败响应
export function fail(res: Response, code: number, message: string) {
  res.json({
    code,
    message,
    data: null
  });
}