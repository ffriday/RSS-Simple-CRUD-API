import { createServer, IncomingMessage } from 'node:http';
import { parse } from 'node:url';

export class MyServer {
  private _log: boolean;
  private _port: number;
  private _server: ReturnType<typeof createServer>;

  constructor(port: number, log: boolean = false) {
    this._log = log;
    this._port = port;
    this.init();
  }

  init() {
    this._server = createServer((req, res) => {
      const { status, response } = this.handle(req);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(response));
      res.end();
    });
    this._server.listen(this._port);
  }

  handle(req: IncomingMessage) {
    this.log(req);
    const s = parse(req.url, true).pathname.split('/').filter(Boolean);
    return { status: 200, response: s };
  }

  log({ url }: IncomingMessage) {
    if (this._log) {
      console.log(`Request at port: ${this._port} to: ${url}`);
    }
  }
}