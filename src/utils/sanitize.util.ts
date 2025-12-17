import { pickBy, isNil, isUndefined } from 'lodash'


export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return pickBy(obj, (value) => {
    if (isUndefined(value)) return false
    if (isNil(value)) return false
    if (typeof value === 'string' && value.trim() === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }) as Partial<T>
}