import { authForm, AuthLoginResponseSchema, NonceResponseSchema, type AuthForm, type AuthLoginResponse, type NonceResponse } from '@/schemas/auth.schema';
import { get, post } from '@/utils/request.util';
import { validateResponse, validateRequest } from '@/utils/validate.util';


export const AuthApi = {
  async getNonce (): Promise<NonceResponse> {
    const res = await get<NonceResponse>('/auth/nonce');
    console.log(res);
    return validateResponse(NonceResponseSchema, res);
  },
  async login(data: AuthForm): Promise<AuthLoginResponse> {
    const safeData = validateRequest(authForm, data);
    const res = await post<AuthLoginResponse>('/auth/login', safeData);
    console.log(res);
    return validateResponse(AuthLoginResponseSchema, res);
  },
};