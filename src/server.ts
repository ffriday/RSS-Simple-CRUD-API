import { createServer, IncomingMessage } from 'node:http';
import { parse } from 'node:url';

enum errorMsg {
  notFound = 'Page not found',
}

export class MyServer {
  private _log: boolean;
  private _port: number;
  private _server: ReturnType<typeof createServer>;

  constructor(port: number, log: boolean = false) {
    this._log = log;
    this._port = port;
    this.init();
  }

  private init() {
    this._server = createServer((req, res) => {
      const { status, response } = this.handle(req);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(response));
      res.end();
    });
    this._server.listen(this._port);
    process.on('SIGINT', () => {
      console.log('Server is shutting down');
      this._server.close(() => {
        process.exit(0);
      });
    })
  }

  private handle(req: IncomingMessage) {
    this.log(req);
    const path = parse(req.url, true).pathname.split('/').filter(Boolean);
    if (!MyServer.isProperUrl(path)) return { status: 404, response: errorMsg.notFound };
    return { status: 200, response: 'ok' };
  }

  private log({ url, method }: IncomingMessage) {
    if (this._log) {
      console.log(`${method} request at port: ${this._port} to: ${url}`);
    }
  }

  private static isProperUrl = (path: string[]): boolean => {
    if (!(path.length === 2 || path.length === 3)) return false;
    if (!(path[0] === 'api' && path[1] === 'users')) return false;
    return true;
  }
}