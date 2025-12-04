export const useStringUtil =() => {
  // 将字符串转为稳定 hash 值（0 ~ 2^32-1）
  const stringToHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // 转 32 bit
    }
    return Math.abs(hash);
  }
  return {
    stringToHash
  }
}