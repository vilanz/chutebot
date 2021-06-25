export const log = (namespace: string, ...args: any[]): void => {
  console.log(`[${namespace}]`, ...args);
};
