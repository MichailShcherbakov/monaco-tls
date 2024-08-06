import {
  IWebSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";
import {
  createConnection,
  createServerProcess,
  forward,
} from "vscode-ws-jsonrpc/server";
import {
  Message,
  InitializeRequest,
  InitializeParams,
} from "vscode-languageserver";

export const launchLanguageServer = (socket: IWebSocket) => {
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);

  const socketConnection = createConnection(reader, writer, () =>
    socket.dispose()
  );

  const serverName = "Language Server";

  const serverConnection = createServerProcess(
    serverName,
    "typescript-language-server",
    ["--stdio"]
  );

  if (!serverConnection) {
    return;
  }

  forward(socketConnection, serverConnection, (message) => {
    if (Message.isRequest(message)) {
      console.log(`${serverName} Server received:`);

      console.log(message);

      if (message.method === InitializeRequest.type.method) {
        const initializeParams = message.params as InitializeParams;
        initializeParams.processId = process.pid;
      }
    }

    if (Message.isResponse(message)) {
      console.log(`${serverName} Server sent:`);
      console.log(message);
    }

    return message;
  });
};
