import { Constants } from '../../../constants';

export interface IEntity {
  id: number | string;
}

export interface IMariaDB {
  init: () => Promise<void>;
  destroy: () => Promise<void>;
  deleteAll: (tableName: Constants) => Promise<void>;
  insert: <T>(tableName: Constants, rows: Partial<T>) => Promise<Partial<T> & IEntity>;
  findbyID: <T>(tableName: Constants, id: string | number) => Promise<T>;
  findByColumn: <T>(tableName: Constants, rows: Partial<T>) => Promise<T>;
  deleteByColumn: <T>(tableName: Constants, row: Partial<T>) => Promise<void>;
}
