import { parseEnv } from './functions';
import cluster, { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';
import { MyServer } from './server';
import { DB, ServerDB } from './db';
import { MyBalancer } from './balancer';

export class App {
  private _port: number;
  private _isCluster = parseEnv('multi');
  private _isLogMode = parseEnv('log');
  private _parralel = availableParallelism();
  private _server: MyServer | MyBalancer;
  private _workers: Worker[];
  private _db: DB;

  constructor(port: number) {
    this._port = port ?? 4000;
    this.init();
  }

  private logStart(type: 'Server' | 'Worker', port: number) {
    console.log(`${type} started at port: ${port}`);
  }

  private init() {
    if (this._isCluster) {
      if (cluster.isPrimary) {
        this.logStart('Server', this._port);
        const workersAmount = this._parralel > 1 ? this._parralel - 1 : 1;
        this._workers = Array(workersAmount)
          .fill(null)
          .map((_, i) => cluster.fork({ PORT: this._port + i + 1 }));
        // this._server = new MyBalancer(this._port, this._db, this._workers);
      } else {
        this.logStart('Worker', this._port);
        this._db = new ServerDB(); //REMOVE
        this._server = new MyServer(this._port, this._db, this._isLogMode);
      }
    } else {
      this.logStart('Server', this._port);
      this._db = new ServerDB();
      this._server = new MyServer(this._port, this._db, this._isLogMode);
    }
  }
}