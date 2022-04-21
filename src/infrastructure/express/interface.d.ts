import { Application } from 'express';

export interface IServer {
  getServer: () => Application;
  set: () => void;
  start: (port: number) => void;
}
