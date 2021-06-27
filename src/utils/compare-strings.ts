const collator = new Intl.Collator("en", { sensitivity: "base" });
export const compareIgnoringAccents = (a: string, b: string) =>
  collator.compare(a.toLowerCase(), b.toLowerCase()) === 0;
