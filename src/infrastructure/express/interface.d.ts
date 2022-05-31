import { Application } from 'express';

export interface IServer {
  getServer: () => Application;
  set: () => void;
  start: (port: string) => void;
  exit: () => void;
}
