// import { createServer, IncomingMessage } from 'node:http';
// import { parse } from 'node:url';

// export class MyBalancer {
//   private _log: boolean;
//   private _port: number;
//   private _server: ReturnType<typeof createServer>;
//   private _workers: Worker[];

//   constructor(port: number, log: boolean = false) {
//     this._log = log;
//     this._port = port;
//     this.init();
//   }

//   private init() {
//     this._server = createServer((req, res) => {
//     });
//     this._server.listen(this._port);
//     process.on('SIGINT', () => {
//       console.log('Server is shutting down');
//       this._server.close(() => {
//         process.exit(0);
//       });
//     })
//   }

//   private handle(req: IncomingMessage) {
//     this.log(req);
//     const path = parse(req.url, true).pathname.split('/').filter(Boolean);
//     if (!MyServer.isProperUrl(path)) return { status: 404, response: errorMsg.notFound };
//     return { status: 200, response: 'ok' };
//   }
// }