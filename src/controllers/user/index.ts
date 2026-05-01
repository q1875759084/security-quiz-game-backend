// TODO: 实现以下功能：
// - 更新用户信息 (PUT /update)
// - 删除用户 (DELETE /delete)

// src/controllers/user/index.ts
import { Request, Response } from "express";
import UserService from "../../services/user";
import { success, fail } from "../../utils/response";

class UserController {
  // 注册
  async register(req: Request, res: Response) {
    try {
      // 1. 获取入参
      const userData = req.body;
      // 2. 调用 UserService.register
      const data = await UserService.register(userData);
      // 3. 返回成功响应
      // success(res, data, "注册成功");

      // 同步service的自动“登录”方案
      success(
        res,
        {
          userInfo: data.userInfo,
          accessToken: data.accessToken,
        },
        "注册成功",
      );
    } catch (error: any) {
      // 统一错误处理
      fail(res, 400, error.message);
    }
  }

  // 登录
  async login(req: Request, res: Response) {
    try {
      // 1. 获取入参
      const { account, password } = req.body;
      // 2. 调用 UserService.login
      const result = await UserService.login(account, password);
      // 3. 生成双Token
      // 分支：浏览器则RefreshToken 写入 HttpOnly Cookie
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 1000, // 7天有效期
        secure: process.env.NODE_ENV === "production", // todo: 生产环境开启
        sameSite: "lax", // 避免CSRF攻击
        path: "/api/user/refresh", // 关键：Cookie只在刷新Token接口生效，其他接口收不到
      });
      // 4. 返回成功响应
      success(
        res,
        {
          userInfo: result.userInfo,
          accessToken: result.accessToken,
        },
        "登录成功",
      );
    } catch (error: any) {
      // 统一错误处理
      fail(res, 400, error.message);
    }
  }

  // 获取当前用户信息
  async getProfile(req: Request, res: Response) {
    try {
      // 从鉴权中间件挂载的上下文拿 userId
      const userId = req.userId!;
      // 调用纯业务 Service
      const userInfo = await UserService.getProfile(userId);
      success(res, { userInfo }, "获取用户信息成功");
    } catch (error: any) {
      fail(res, 400, error.message);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      // 1. 从httpOnly cookie中获取refresh_token
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        return fail(res, 401, "未提供刷新凭证，请重新登录");
      }
      // 2. 调用 Service刷新
      const result = await UserService.refreshToken(refreshToken);
      // 3. 更新refresh_token
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 1000, // 7天有效期
        secure: process.env.NODE_ENV === "production", // todo: 生产环境开启
        sameSite: "lax", // 避免CSRF攻击
        path: "/api/user/refresh", // 关键：Cookie只在刷新Token接口生效，其他接口收不到
      });
      // 4. 更新AccessToken
      success(res, { accessToken: result.accessToken }, "刷新Token成功");
    } catch (error: any) {
      if (error.message === "用户不存在") {
        res.clearCookie("refresh_token");
        return fail(res, 401, "用户不存在，请重新登录");
      }
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        res.clearCookie("refresh_token", { path: "/api/user/refresh" });
        return fail(res, 401, "刷新凭证无效或已过期，请重新登录");
      }
      // 3. 其他未知错误
      fail(res, 400, "刷新失败，请稍后重试");
    }
  }

  // ========== 新增：退出登录 ==========
  async logout(_: Request, res: Response) {
    try {
      // 清除 HttpOnly Cookie
      res.clearCookie("refresh_token", { path: "/api/user/refresh" });
      success(res, null, "退出登录成功");
    } catch (error: any) {
      fail(res, 400, error.message);
    }
  }
}
// 单例导出（企业级规范）
export default new UserController();