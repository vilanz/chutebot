import { compareSeason } from "./sort-by-season";

test.each([
  ["2006", "2007"],
  ["2009", "2010"],
  ["20/21", "2022"],
  ["20/21", "2021"],
])("seasons smaller than the other", (a, b) => {
  expect(compareSeason(a, b)).toBeGreaterThan(0);
});

test.each([
  ["2000", "1997"],
  ["2018", "2008"],
  ["20/21", "2007"],
  ["20/21", "2020"],
])("seasons greater than the other", (a, b) => {
  expect(compareSeason(a, b)).not.toBeGreaterThanOrEqual(0);
});

test.each([
  ["2000", "2000"],
  ["2018", "2018"],
  ["20/21", "20/21"],
])("seasons equal to the other", (a, b) => {
  expect(compareSeason(a, b)).toBe(0);
});
