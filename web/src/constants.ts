export const rootUri = "/workspace";
export const indexFileUri = `${rootUri}/index.ts`;
export const indexFileContent = `import { print } from "./lib.ts";

print();
`;

export const libFileUri = `${rootUri}/lib.ts`;
export const libFileContent = `export function print() {}`;
