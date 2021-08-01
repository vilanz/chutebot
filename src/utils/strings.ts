export const linebreak = (...strings: string[]) => strings.join("\n");

export const mapLinebreak = <T extends unknown>(
  list: T[],
  mapping: (t: T, i: number) => string
) => linebreak(...list.map((x, i) => mapping(x, i)));

export const EMPTY_CHAR = "\u200b";
