export interface IMariaDB {
  init: () => Promise<void>;
  close: () => Promise<void>;
}
