import { parseEnv } from './functions';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { MyServer } from './server';

export class App {
  private _port: number;
  private _isCluster = parseEnv('multi');
  private _isLogMode = parseEnv('log');
  private _parralel = availableParallelism();
  private _server: MyServer;

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
        const workersAnount = this._parralel > 1 ? this._parralel - 1 : 1;
        const workers = Array(workersAnount)
          .fill(null)
          .map((_, i) => cluster.fork({ PORT: this._port + i + 1 }));
        workers.find(e => e);
      } else {
        this.logStart('Worker', this._port);
      }
    } else {
      this.logStart('Server', this._port);
    }
    this._server = new MyServer(this._port, this._isLogMode);
  }
}