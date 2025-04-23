import * as shoulda from "@philc/shoulda";
const { assert, context, setup, should, stub } = shoulda;
import "../../content_scripts/keyboard_utils.js";
import "../../content_scripts/sheet_actions.js";
import * as jsdom from "jsdom";

export function jsdomStub(html) {
  const w = new jsdom.JSDOM(html).window;
  stub(globalThis, "window", w);
  stub(globalThis, "document", w.document);
}

context("openCellAsUrl", () => {
  setup(() => {
    SheetActions.typeKeyFn = function () {};
  });

  should("open embedded anchor tags", () => {
    const html = `<div id='t-formula-bar-input-container'>
      <div class='cell-input'>
        <a data-sheets-formula-bar-text-link='example1.com'></a>
        <a data-sheets-formula-bar-text-link='example2.com'></a>
      </div>
    </div>`;
    jsdomStub(html);
    const opened = [];
    stub(window, "open", (url) => {
      opened.push(url);
    });
    SheetActions.openCellAsUrl();
    assert.equal(["example1.com", "example2.com"], opened);
  });

  should("open HYPERLINK formulas", () => {
    const html = `<div id='t-formula-bar-input-container'>
      <div class='cell-input'>
        hello HYPERLINK("example.com", "caption") world
      </div>
    </div>`;
    jsdomStub(html);
    const opened = [];
    stub(window, "open", (url) => {
      opened.push(url);
    });
    SheetActions.openCellAsUrl();
    assert.equal(["example.com"], opened);
  });

  should("open URL-like strings", () => {
    const html = `<div id='t-formula-bar-input-container'>
      <div class='cell-input'>
        hello https://example.com world
      </div>
    </div>`;
    jsdomStub(html);
    const opened = [];
    stub(window, "open", (url) => {
      opened.push(url);
    });
    SheetActions.openCellAsUrl();
    assert.equal(["https://example.com"], opened);
  });
});
