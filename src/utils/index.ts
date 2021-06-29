export const secondsToMs = (s: number) => s * 1000;

export const getRandomNumberUpTo = (max: number) =>
  Math.floor(Math.random() * max);

export const waitSeconds = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, secondsToMs(seconds)));
