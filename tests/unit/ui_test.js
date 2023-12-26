import * as shoulda from "https://deno.land/x/shoulda@v2.0/shoulda.js";
const { assert, context, setup, should, stub } = shoulda;
import "../../content_scripts/settings.js";
import "../../content_scripts/sheet_actions.js";
import "../../content_scripts/commands.js";
import "../../content_scripts/keyboard_utils.js";
import "../../content_scripts/ui.js";

context("UI methods", () => {
  should("invertObjectMap", () => {
    const o = { a: "b", c: "d" };
    assert.equal({ b: "a", d: "c" }, invertObjectMap(o));
  });

  should("buildKeyMappingsPrefixes", () => {
    const ui = new UI();
    const mappings = {
      "normal": {
        "moveUp": "a•b•c",
        "moveDown": "a•d",
        "moveLeft": "x•y",
        "moveDown": "z",
      },
    };
    const result = ui.buildKeyMappingsPrefixes(mappings);
    assert.equal({ "a": true, "a•b": true, "x": true }, result["normal"]);
  });
});

context("onKeyDown", () => {
  let ui;
  let commandsInvoked;
  const keydownEvent = (props) => Object.assign(new Event("keydown"), props);
  const keydown = (props) => {
    const event = Object.assign(new Event("keydown"), props);
    return ui.onKeydown(event);
  };

  setup(async () => {
    commandsInvoked = [];
    stub(Settings, "loadUserKeyMappings", async () => {
      return {
        normal: { "moveUp": "k", "moveDown": "a•b" },
        insert: {},
      };
    });
    stub(Commands.commands, "moveUp", {
      fn: () => commandsInvoked.push("moveUp"),
    });
    stub(Commands.commands, "moveDown", {
      fn: () => commandsInvoked.push("moveDown"),
    });
    ui = new UI();
    await ui.loadKeyMappings();
  });

  should("invoke command bound to a keystroke", () => {
    keydown({ key: "k" });
    assert.equal(["moveUp"], commandsInvoked);
  });

  should("invoke command bound to a double keystroke", () => {
    keydown({ key: "a" });
    assert.equal([], commandsInvoked);
    keydown({ key: "b" });
    assert.equal(["moveDown"], commandsInvoked);
  });

  should("invoke no commands if none are bound", () => {
    keydown({ key: "z" });
    assert.equal([], commandsInvoked);
  });

  should("repeat a command when a number prefix is typed", () => {
    keydown({ key: "3" });
    assert.equal([], commandsInvoked);
    keydown({ key: "k" });
    assert.equal(["moveUp", "moveUp", "moveUp"], commandsInvoked);
  });

  should("handle two digit repeat prefixes", () => {
    keydown({ key: "1" });
    keydown({ key: "2" });
    keydown({ key: "k" });
    assert.equal(12, commandsInvoked.length);
  });

  should("allow a maximum repeat of 99", () => {
    keydown({ key: "2" });
    keydown({ key: "0" });
    keydown({ key: "0" });
    keydown({ key: "k" });
    assert.equal(99, commandsInvoked.length);
  });
});
