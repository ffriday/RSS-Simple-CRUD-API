import { createServer, IncomingMessage } from 'node:http';
import { parse } from 'node:url';
import { validate } from 'uuid';
import { DB, UserBody } from './db';

enum systemMsg {
  notFound = 'Page not found',
  novValidId = 'User ID is not valid format',
}

export class MyServer {
  private _log: boolean;
  private _port: number;
  private _server: ReturnType<typeof createServer>;
  private _db: DB;

  constructor(port: number, db: DB, log: boolean = false) {
    this._log = log;
    this._port = port;
    this._db = db;
    this.init();
  }

  private async init() {
    this._server = createServer(async (req, res) => {
      const { status, response } = await this.handle(req);
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

  private async handle(req: IncomingMessage) {
    this.log(req);
    const path = parse(req.url, true).pathname.split('/').filter(Boolean);
    console.log(path);
    if (!MyServer.isProperUrl(path)) return { status: 404, response: systemMsg.notFound };
    if (path[2] && !validate(path[2])) return { status: 400, response: systemMsg.novValidId };

    switch(req.method) {
      case 'POST':
        try {
          const body = await MyServer.getBody(req);
          console.log(body);
        } catch (err) {
          console.log(err);
        }
        break;
    }

    console.log(this._db.getAll());
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

  private static getBody = async (req: IncomingMessage): Promise<UserBody | null> => {
    return new Promise((resolve, reject) => {
      const body: string[] = [];

      req.on('data', (chunk: string) => body.push(chunk.toString()));
      req.on('end', () => {
        try {
          const parsedBody = JSON.parse(body.join(''));
          resolve(parsedBody);
        } catch {
          reject(null);
        }
      });
      req.on('error', () => reject(null));
    });
  }

  // private static ckeckUser (user: Partial<User>, id: boolean = false): boolean {
  //   const kays = ['username',]
  // }

  // private static handlePUT = ()
}