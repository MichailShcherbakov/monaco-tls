import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-typescript-language-features-default-extension";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import {
  RegisteredFileSystemProvider,
  registerFileSystemOverlay,
  RegisteredMemoryFile,
} from "@codingame/monaco-vscode-files-service-override";
import * as monaco from "monaco-editor";
import { configureMonacoWorkers } from "./configure_monaco_workers";
import { initServices } from "monaco-languageclient/vscode/services";
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket,
} from "vscode-ws-jsonrpc";
import { createLanguageClient } from "./create_language_client";
import { indexFileContent, indexFileUri } from "./constants";
import "vscode/localExtensionHost";

export const bootstrap = async () => {
  configureMonacoWorkers();

  await initServices({
    serviceConfig: {
      userServices: {
        ...getThemeServiceOverride(),
        ...getKeybindingsServiceOverride(),
        ...getTextmateServiceOverride(),
      },
      enableExtHostWorker: true,
      debugLogging: true,
    },
  });

  const indexUri = monaco.Uri.file(indexFileUri);

  const fileSystemProvider = new RegisteredFileSystemProvider(false);

  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(indexUri, indexFileContent)
  );

  registerFileSystemOverlay(1, fileSystemProvider);

  const modelRef = await monaco.editor.createModelReference(indexUri);

  const model = modelRef.object.textEditorModel;

  monaco.editor.create(document.getElementById("monaco-editor-root")!, {
    model,
    language: "typescript",
  });

  const ws = new WebSocket("ws://localhost:4040/ls");

  ws.onopen = () => {
    const socket = toSocket(ws);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);

    const languageClient = createLanguageClient({
      reader,
      writer,
    });

    languageClient.start();

    console.log("Connected");

    reader.onClose(() => languageClient.stop());
  };

  return ws;
};
