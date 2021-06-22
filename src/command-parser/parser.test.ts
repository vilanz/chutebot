import { parseCommand } from ".";

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

test.each(["big invalid command", "  ", "g!", ""])(
  "parsing invalid commands returns null",
  (command) => {
    expect(parseCommand(command)).toBeNull();
  }
);
