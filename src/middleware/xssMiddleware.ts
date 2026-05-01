import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

type XSSCleanable = string | object | any[] | null | undefined;

/**
 * 递归清洗XSS，泛型保证输入输出类型一致
 * @param data 待清洗的数据
 * @returns 清洗后的数据，类型与输入一致
 */
function cleanXSS<T>(data: T): T {
  // 空值直接返回（TS会自动处理类型，不会返回undefined给非undefined类型）
  if (data === null || data === undefined) {
    return data;
  }

  // 字符串：用xss转义，返回值仍为string，通过类型断言匹配泛型T
  if (typeof data === 'string') {
    return xss(data) as unknown as T;
  }

  // 数组：递归清洗每个元素，返回类型与原数组一致
  if (Array.isArray(data)) {
    return data.map(item => cleanXSS(item)) as unknown as T;
  }

  // 对象：递归清洗每个属性，返回类型与原对象一致
  if (typeof data === 'object' && data !== null) {
    const cleanedObj = {} as T;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleanedObj[key] = cleanXSS(data[key]);
      }
    }
    return cleanedObj;
  }

  // 其他类型（number/boolean等）直接返回
  return data;
}

const xssMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.body = cleanXSS(req.body);
  req.query = cleanXSS(req.query);
  req.params = cleanXSS(req.params);
  next();
};

export default xssMiddleware;