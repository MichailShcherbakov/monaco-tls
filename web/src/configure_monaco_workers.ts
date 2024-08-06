import { useWorkerFactory } from "monaco-editor-wrapper/workerFactory";

export const configureMonacoWorkers = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL(
            "monaco-editor/esm/vs/editor/editor.worker.js",
            import.meta.url
          ),
          { type: "module" }
        ),
    },
  });
};
