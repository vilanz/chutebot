import { parseUserInput } from "./parser";

test("parsing a simple command", () => {
  expect(parseUserInput("c!ping")).toEqual({
    name: "ping",
    args: "",
  });
});

test("parsing a command with args", () => {
  expect(parseUserInput("c!kick fire extinguisher")).toEqual({
    name: "kick",
    args: "fire extinguisher",
  });
});

test.each(["big invalid command", "  ", "g!", ""])(
  "parsing invalid commands returns null",
  (command) => {
    expect(parseUserInput(command)).toBeNull();
  }
);
