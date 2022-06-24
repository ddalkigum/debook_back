import { Types } from 'aws-sdk/clients/acm';
import { Constants } from '../../../constants';
import { DateTimeEntity } from './entity/datetime';

export interface IEntity {
  id: number | string;
}

export type Result<T> = T;

export type InsertRows<T> = Omit<T, keyof DateTimeEntity>;
export type InsertRowsWithoutID<T> = Omit<InsertRows<T>, keyof IEntity>;

export type InsertBulk<T> = Omit<
  {
    [K in keyof T]: T[K];
  },
  'id'
>;

export interface IMariaDB {
  init: () => Promise<void>;
  destroy: () => Promise<void>;
  deleteAll: (tableName: Constants) => Promise<void>;
  insert: <T>(tableName: Constants, rows: InsertRows<T>) => Promise<InsertRows<T>>;
  insertWithoutID: <T extends IEntity>(tableName: Constants, rows: InsertRowsWithoutID<T>) => Promise<InsertRows<T>>;
  insertBulk: <T>(tableName: Constants, rows: InsertRowsWithoutID<T>[]) => Promise<InsertRowsWithoutID<T>[]>;
  findbyID: <T>(tableName: Constants, id: string | number) => Promise<T>;
  findByColumn: <T>(tableName: Constants, rows: Partial<T>) => Promise<T[]>;
  findByUniqueColumn: <T>(tableName: Constants, rows: Partial<T>) => Promise<T>;
  executeQuery: (query: string, params?: any[]) => Promise<any>;
  deleteByColumn: <T>(tableName: Constants, row: Partial<T>) => Promise<void>;
  updateByColumn: <T>(tableName: Constants, whereCondition: Partial<T>, rows: Partial<T>) => Promise<Partial<T>>;
}
