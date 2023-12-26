import * as shoulda from "https://deno.land/x/shoulda@v2.0/shoulda.js";
const { assert, context, should } = shoulda;
import "../../content_scripts/sheet_actions.js";
import "../../content_scripts/commands.js";
import "../../content_scripts/ui.js";

context("UI", () => {
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
