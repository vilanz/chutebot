import { arePlayerNamesEqual } from "./compare-names";

const testGuesses = (name: string, right: string[], wrong: string[]) => {
  test.each(right)(`${name} === %s`, (guess: string) => {
    expect(arePlayerNamesEqual(name, guess)).toBe(true);
  });
  test.each(wrong)(`${name} !== %s`, (guess: string) => {
    expect(arePlayerNamesEqual(name, guess)).toBe(false);
  });
};

testGuesses(
  "José",
  ["jose", "José", "Jose"],
  ["joao", " ", "johnny soccer", "zé"]
);

testGuesses(
  "Lucas Cruz Almeida",
  ["cruz", "cruz almeida", "almeida"],
  ["Lucas", " ", "zum", "alme"]
);