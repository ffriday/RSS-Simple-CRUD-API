import { createServer, IncomingMessage } from 'node:http';
import { parse } from 'node:url';
import { validate } from 'uuid';
import { DB, User, UserBody } from './db';

enum systemMsg {
  notFound = 'Page not found',
  notValidId = 'User ID is not valid format',
  wrongId = 'User ID does not exist',
  notValidBody = 'Wrong data format',
  serverError = 'Server error',
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
    if (!MyServer.isProperUrl(path)) return { status: 404, response: systemMsg.notFound };
    if (path[2] && !validate(path[2])) return { status: 400, response: systemMsg.notValidId };

    switch (req.method) {
      case 'POST':
        try {
          const body = await MyServer.getBody(req);
          if (path[2]) return { status: 400, response: systemMsg.notFound };
          if (!MyServer.ckeckUser(body)) return { status: 400, response: systemMsg.notValidBody };
          const user = this._db.post(body);
          return { status: 201, response: user };
        } catch (err) {
          console.log(err);
          return { status: 500, response: systemMsg.serverError };
        }
        break;
      case 'GET':
        if (path[2]) {
          const user = this._db.get(path[2]);
          if (user) return { status: 200, response: user };
          return { status: 404, response: systemMsg.wrongId };
        } else {
          return { status: 200, response: this._db.getAll() };
        }
        break;
      case 'DELETE': {
        const res = this._db.delete(path[2])
        if (res) return { status: 204, response: null };
        return { status: 404, response: systemMsg.wrongId };
      }
    }

    console.log(this._db.getAll()); // REMOVE
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

  private static ckeckUser(user: Partial<User>, id: boolean = false): boolean {
    const keys = ['username', 'age', 'hobbies'];
    if (id) keys.push('id');
    return keys.reduce((acc, key) => {
      if (!(key in user)) acc = false;
      return acc;
    }, true)
  }
}