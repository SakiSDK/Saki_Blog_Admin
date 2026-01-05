import { z } from 'zod';
import { zEmail, zId, zStr } from './common.schema';
import { ResponseSchema } from './base.schema';


/** ---------- 数据schema ---------- */
/** 登录表单Schema */
export const authForm = z.object({
  email: zEmail
    .describe("邮箱"),
  password: zStr
    .max(50, "密码最多50个字符")
    .regex(/^[a-zA-Z0-9._\u4e00-\u9fa5\-]+$/, "密码只能包含中英文、数字、下划线、横线、点号")
    .describe("密码"),
  nonce: z.string().describe("随机数"),
})

export const userData = z.object({
  id: zId.describe("用户ID"),
  shortId: z.string().describe("用户短ID"),
  nickname: z.string().describe("昵称"),
  email: z.string().describe("邮箱"),
  bio: z.string().describe("简介"),
  avatar: z.string().describe("头像"),
  gender: z.string().describe("性别"),
  createdAt: z.string().describe("创建时间"),
})

export const authResData = z.object({
  user: userData.optional(),
  accessToken: z.string().describe("访问token"),
  expiresIn: z.number().int().describe("token有效期"),
})

export const nonceDataSchema = z.object({
  nonce: z.string().describe("随机数"),
});


/** ---------- 返回登录响应Schema ---------- */
export const AuthLoginResponseSchema = ResponseSchema(authResData);
export const NonceResponseSchema = ResponseSchema(nonceDataSchema);


/** ---------- 类型导出 ---------- */
// 返回值类型
export type AuthLoginResponse = z.infer<typeof AuthLoginResponseSchema>;
export type NonceResponse = z.infer<typeof NonceResponseSchema>;
// 基础类型
export type AuthForm = z.infer<typeof authForm>;
export type AuthResData = z.infer<typeof authResData>;
export type UserData = z.infer<typeof userData>;
