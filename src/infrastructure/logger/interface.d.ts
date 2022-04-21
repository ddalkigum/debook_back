import { Handler } from 'express';

export interface IWinstonLogger {
  init: () => boolean;
  debug: (message: any) => void;
  http: (message: any) => void;
  info: (message: any) => void;
  warn: (message: any) => void;
  error: (message: any) => void;
}

export interface IMorganLogger {
  init: () => Handler;
}
