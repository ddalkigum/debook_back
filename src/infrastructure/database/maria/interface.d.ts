import { Constants } from '../../../constants';

export interface IEntity {
  id: number | string;
}

export interface IMariaDB {
  init: () => Promise<void>;
  destroy: () => Promise<void>;
  deleteAll: (tableName: Constants) => Promise<void>;
  insert: <T extends IEntity>(tableName: Constants, row: Partial<T>) => Promise<T>;
  findbyID: <T extends IEntity>(tableName: Constants, id: string | number) => Promise<T>;
  findByColumn: <T>(tableName: Constants, rows: Partial<T>) => Promise<T>;
}
