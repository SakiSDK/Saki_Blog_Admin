import type { FormItemRule } from 'element-plus';
import type { ZodSchema } from 'zod';

export const zodValidator = (schema: ZodSchema<any>): FormItemRule['validator'] => {
  return (rule, value, callback) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const error = result.error.issues[0]?.message || '校验失败';
      callback(new Error(error));
    } else {
      callback();
    }
  };
}