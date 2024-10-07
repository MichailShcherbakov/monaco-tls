import http from "node:http";
import { IWebSocket } from "vscode-ws-jsonrpc";

import { WebSocketServer } from "ws";

import { launchLanguageServer } from "./launch_language_server.ts";

const HTTP_SERVER_PORT = 4040;
const LS_CONNECTION_PATHNAME = "/ls";

const wsServer = new WebSocketServer({
  noServer: true,
  perMessageDeflate: false,
  clientTracking: true,
});

const httpServer = http.createServer();

httpServer.on("upgrade", (req, socket, head) => {
  const baseURL = `http://${req.headers.host}/`;
  const pathname = req.url && new URL(req.url, baseURL).pathname;

  if (pathname !== LS_CONNECTION_PATHNAME) {
    return;
  }

  wsServer.handleUpgrade(req, socket, head, (ws) => {
    const socket: IWebSocket = {
      send: (content) =>
        ws.send(content, (error) => {
          if (error) {
            throw error;
          }
        }),
      onMessage: (cb) =>
        ws.on("message", (data) => {
          console.log(data.toString());
          cb(data);
        }),
      onError: (cb) => ws.on("error", cb),
      onClose: (cb) => ws.on("close", cb),
      dispose: () => ws.close(),
    };

    if (ws.readyState === ws.OPEN) {
      launchLanguageServer(socket);
    } else {
      ws.on("open", () => launchLanguageServer(socket));
    }
  });
});

httpServer.listen(HTTP_SERVER_PORT);

console.info(`The server is running on ${HTTP_SERVER_PORT} port...`);
