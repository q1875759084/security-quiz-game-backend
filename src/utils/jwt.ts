import jwt from 'jsonwebtoken';

// 密钥从环境变量读取，未配置时拒绝启动（Fail Fast）
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET 环境变量未配置，应用拒绝启动');
}
const ACCESS_EXPIRES = '1h';   // 短有效期：访问令牌
const REFRESH_EXPIRES = '7d'; // 长有效期：刷新令牌

// 生成双 Token
export function generateTokens(userId: number) {
  const payload = { userId };
  // 生成 AccessToken
  const accessToken = jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRES });
  // 生成 RefreshToken
  const refreshToken = jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
}

/**
 * 校验Token（通用）
 */
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { userId: number };
}