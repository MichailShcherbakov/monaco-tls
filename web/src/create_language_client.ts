import { MonacoLanguageClient } from "monaco-languageclient";
import {
  MessageTransports,
  CloseAction,
  ErrorAction,
} from "vscode-languageclient";
import * as monaco from "monaco-editor";
import { rootUri } from "./constants";

export const createLanguageClient = (transports: MessageTransports) => {
  return new MonacoLanguageClient({
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ["typescript"],
      workspaceFolder: {
        index: 0,
        name: "workspace",
        uri: monaco.Uri.parse(rootUri),
      },
      // disable the default error handler
      errorHandler: {
        closed: () => ({ action: CloseAction.DoNotRestart }),
        error: () => ({ action: ErrorAction.Continue }),
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: async () => Promise.resolve(transports),
    },
    name: "TS LS",
  });
};
