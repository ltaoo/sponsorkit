import { twMerge } from "tailwind-merge";

export function cn(...inputs: unknown[]) {
  return twMerge(inputs as string[]);
}

/**
 * 将对象转成 search 字符串，前面不带 ?
 * @param query
 * @returns
 */
export function query_stringify(
  query?: null | Record<string, string | number | undefined>
) {
  if (query === null) {
    return "";
  }
  if (query === undefined) {
    return "";
  }
  return Object.keys(query)
    .filter((key) => {
      return query[key] !== undefined;
    })
    .map((key) => {
      return `${key}=${encodeURIComponent(query[key] || "")}`;
    })
    .join("&");
}

/**
 * 延迟指定时间
 * @param delay 要延迟的时间，单位毫秒
 * @returns
 */
export function sleep(delay: number = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, delay);
  });
}

const defaultRandomAlphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
/**
 * 返回一个指定长度的随机字符串
 * @param length
 * @returns
 */
export function random_string(length: number) {
  return random_string_with_alphabet(length, defaultRandomAlphabet);
}
function random_string_with_alphabet(length: number, alphabet: string) {
  const b = new Array(length);
  const max = alphabet.length;
  for (let i = 0; i < b.length; i++) {
    const n = Math.floor(Math.random() * max);
    b[i] = alphabet[n];
  }
  return b.join("");
}

export function generate_unique_id() {
  return random_string(6);
}
