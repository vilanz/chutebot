const collator = new Intl.Collator("en", { sensitivity: "base" });

const compareIgnoringCulture = (a: string, b: string): boolean =>
  collator.compare(a.toLowerCase(), b.toLowerCase()) === 0;

const splitSpaces = (name: string) => name.split(" ");

export const guessPlayerName = (playerName: string, guess: string): boolean => {
  const isExactMatch = compareIgnoringCulture(playerName, guess);
  if (isExactMatch) {
    return true;
  }
  const playerSurnames = splitSpaces(playerName).slice(1);
  const guessWords = splitSpaces(guess);
  // this is likely dogshit slow
  // TODO just normalize all names and surnames and compare them
  return playerSurnames.some((p) =>
    guessWords.some((g) => compareIgnoringCulture(p, g))
  );
};
