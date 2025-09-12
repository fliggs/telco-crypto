import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

export function get<T>(key: string): T | null;
export function get<T>(key: string, def: T): T;
export function get<T>(key: string, def?: T): T | null {
  const str = storage.getString(key);
  return str ? JSON.parse(str) : def ?? null;
}

export function set<T>(key: string, value: T) {
  if (typeof value === "undefined" || value === null) {
    storage.delete(key);
  } else {
    storage.set(key, JSON.stringify(value));
  }
}
