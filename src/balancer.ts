/* eslint-disable @typescript-eslint/no-unused-vars */
import { IncomingMessage, createServer, ServerResponse } from 'node:http';
import { Worker } from 'node:cluster';
import { parse } from 'node:url';
import { DB } from './db';

export type dataMsg = {
  type: 'connection',
  payload: {
    req: IncomingMessage,
    res: ServerResponse,
  }
}

export class MyBalancer {
  private _port: number;
  private _server: ReturnType<typeof createServer>;
  private _workers: Worker[];
  private _db: DB;
  private _current = 0;

  constructor(port: number, db: DB, workers: Worker[]) {
    this._port = port;
    this._db = db;
    this._workers = workers;
    this.init();
  }

  private init() {
    this._server = createServer((req, res) => {
      this._workers[this._current].send({ type: 'connection', payload: {req, res} });
      this.next();
    });
    this._server.listen(this._port);
    process.on('SIGINT', () => {
      console.log('Server is shutting down');
      this._server.close(() => {
        process.exit(0);
      });
    })
  }

  private next() {
    if (this._current < this._workers.length - 1) {
      this._current++;
    } else {
      this._current = 0;
    }
  }
}