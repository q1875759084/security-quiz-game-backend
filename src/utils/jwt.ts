import jwt from 'jsonwebtoken';

// 密钥（真实项目放到 .env 环境变量）
// 【密钥建议放到环境变量，这里先写死演示】
const SECRET = 'YOUR_QUIZ_GAME_SECRET'; 
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