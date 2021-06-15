import { parseCommand } from "./parser";

const invalidCommands = ["", "agnoline", "g!"];
test.each(invalidCommands)(
  "parsing invalid commands returns null",
  (command) => {
    expect(parseCommand(command)).toBeNull();
  }
);

test("parsing a simple command", () => {
  expect(parseCommand("g!ping")).toEqual({
    name: "ping",
    args: "",
  });
});

test("parsing a command with args", () => {
  expect(parseCommand("g!kick fire extinguisher")).toEqual({
    name: "kick",
    args: "fire extinguisher",
  });
});
