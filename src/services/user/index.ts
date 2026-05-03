// 用户服务
// 此文件用于处理用户相关的业务逻辑

// TODO: 实现以下功能：
// - 用户注册业务逻辑
// - 用户登录业务逻辑
// - 用户信息查询
// - 用户信息更新
// - 用户密码加密与验证

import { generateTokens, verifyToken } from "../../utils/jwt";
import bcrypt from "bcryptjs";
import {
  createUser,
  checkUserExists,
  getUserByField,
} from "../../database/user";

// 所有的数据写入均需严格按照 1.校验 2.查重 3.加密 4.入口 5.脱敏返回 进行处理

class UserService {
  /**
   * 用户注册
   * @param userData 前端提交的注册参数
   */
  async register(userData: {
    username: string;
    password: string;
    email?: string;
    phone?: string;
    nickname?: string;
  }) {
    // 1. 基础参数校验
    const { username, password, email, phone, nickname } = userData;
    // 用户名校验：6-20位，字母/数字/下划线
    const usernameReg = /^[a-zA-Z0-9_]{6,20}$/;
    if (!usernameReg.test(username)) {
      throw new Error("用户名格式错误：6-20位字母、数字、下划线");
    }
    // 密码长度校验
    if (password.length < 6) {
      throw new Error("密码长度不能少于6位");
    }
    // 邮箱格式校验（选填）
    if (email) {
      const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
      if (!emailReg.test(email)) {
        throw new Error("邮箱格式错误");
      }
    }
    // 手机号格式校验（选填）
    if (phone) {
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(phone)) {
        throw new Error("手机号格式错误");
      }
    }

    // 2. 唯一性查重
    if (checkUserExists("username", username)) {
      throw new Error("用户名已存在");
    }
    if (email && checkUserExists("email", email)) {
      throw new Error("邮箱已被注册");
    }
    if (phone && checkUserExists("phone", phone)) {
      throw new Error("手机号已被注册");
    }

    // 3. 密码加密（bcrypt 10轮加盐，行业标准）
    const password_hash = await bcrypt.hash(password, 10);

    // 4. 入库创建用户
    const result = createUser({
      username,
      password_hash,
      email: email || null,
      phone: phone || null,
      nickname: nickname || username,
    });

    // 解耦方案：注册和登录不绑定 5. 返回脱敏用户信息
    // return {
    //   id: result.lastInsertRowid,
    //   username,
    //   email,
    //   phone,
    //   nickname: nickname || username,
    // };

    // 自动“登录”方案：注册成功后，直接诶生成token+cookie
    const { accessToken, refreshToken } = generateTokens(
      result.lastInsertRowid as number,
    );
    return {
      userInfo: {
        id: result.lastInsertRowid,
        username,
        email,
        phone,
        nickname: nickname || username,
      },
      accessToken, // 直接返回登录令牌
      refreshToken,
    };
  }

  /**
   * 用户登录
   * @param account 账号（username/email/phone）
   * @param password 明文密码
   */
  async login(account: string, password: string) {
    // 1. 基础校验（纯业务规则，无HTTP）
    if (!account || !password) {
      throw new Error("账号和密码不能为空");
    }
    // 2. 自动识别账号类型 & 查询用户是否存在
    let user;
    const phoneReg = /^1[3-9]\d{9}$/;
    const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;

    if (phoneReg.test(account)) {
      // 手机号登录
      user = await getUserByField("phone", account);
    } else if (emailReg.test(account)) {
      // 邮箱登录
      user = await getUserByField("email", account);
    } else {
      // 用户名登录
      user = await getUserByField("username", account);
    }
    if (!user) {
      throw new Error("账号不存在");
    }
    // 3. 校验密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error("密码错误");
    }

    // 4. 生成双Token
    const { accessToken, refreshToken } = generateTokens(user.id);
    // 5. 返回用户信息+Token
    return {
      userInfo: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * 获取当前用户信息
   * @param userId token解析的用户ID
   */
  async getProfile(userId: number) {
    if (!userId) throw new Error("用户ID不能为空");

    const user = await getUserByField("id", userId);
    if (!user) throw new Error("用户不存在");

    // 强制脱敏，剔除敏感字段
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
    };
  }

  /**
   * 刷新Token
   * @param refreshToken 刷新凭证
   */
  async refreshToken(refreshT: string) {
    // 1. 校验刷新凭证
    const payload = verifyToken(refreshT) as { userId: number };
    // 2. 校验用户是否存在
    const user = await getUserByField("id", payload.userId);
    if (!user) throw new Error("用户不存在");
    // 3. 生成新Token
    const { accessToken, refreshToken } = generateTokens(user.id);
    // 4. 返回新Token
    return {
      accessToken,
      refreshToken,
    };
  }

  // ========== 退出登录（空实现，业务层无需处理） ==========
  async logout() {
    return true;
  }
}

// 企业级单例导出
export default new UserService();
