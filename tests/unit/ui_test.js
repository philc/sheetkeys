import * as shoulda from "../vendor/shoulda.js";
import {context, should, assert} from "../vendor/shoulda.js";
import "../../content_scripts/ui.js";

context("UI", () => {
  should("invertObjectMap", () => {
    const o = {a: "b", c: "d"};
    assert.equal({b: "a", d: "c"},
                 invertObjectMap(o));
  });
});
