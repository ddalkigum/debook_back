export interface IRedisDB {
  init: () => Promise<void>;
  close: () => Proimse<void>;
}
