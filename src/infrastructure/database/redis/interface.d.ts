export interface RedisOptions {
  expireTime?: number;
}

export interface IRedisDB {
  init: () => Promise<void>;
  close: () => Proimse<void>;
  insert: (key: string, value: string, options?: RedisOptions) => Promise<void>;
  find: (key: string) => Promise<string>;
  remove: (key: string) => Promise<void>;
}
