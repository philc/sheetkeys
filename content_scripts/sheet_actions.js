const SheetActions = {
  // NOTE(philc): When developing, you can use this snippet to preview all available menu items:
  // Array.from(document.querySelectorAll(".goog-menuitem")).forEach((i) => console.log(i.innerText))
  menuItems: {
    copy: "Copy",
    // This string with a space at the end is meant to match the button "Row X(D)" where X is some number.
    // When multiple rows are selected, the capture is "Rows X(D)".
    deleteRow: /^Row[s]? \d+\(D\)/,
    deleteColumn: /^Column[s]? (?!stats)/, // Avoid matching the menu item "Column stats".
    deleteValues: "Values",
    rowAbove: /^Insert \d+ row above/,
    rowBelow: /^Insert \d+ row below/,
    fontSizeMenu: "Font size►",
    freezeRow: /Up to row \d+/, // This is a sub-item of the "Freeze" menu.
    freezeColumn: /Up to column [A-Z]+/, // This is a sub-item of the "Freeze" menu.
    moveRowUp: /Rows? up/,
    moveRowDown: /Rows? down/,
    moveColumnLeft: /Columns? left/,
    moveColumnRight: /Columns? right/,
    paste: "Paste",
    undo: "Undo",
    redo: "Redo",
    fullScreen: "Full screen",
    mergeAll: "Merge all",
    mergeHorizontally: "Merge horizontally",
    mergeVertically: "Merge vertically",
    unmerge: "Unmerge"
  },

  buttons: {
    center: ["Horizontal align", "Center"],
    clip: ["Text wrapping", "Clip"],
    left: ["Horizontal align", "Left"],
    right: ["Horizontal align", "Right"],
    overflow: ["Text wrapping", "Overflow"],
    wrap: ["Text wrapping", "Wrap"]
  },

  // You can find the names of these color swatches by hovering over the swatches and seeing the tooltip.
  colors: {
    white: "white",
    lightYellow3: "light yellow 3",
    lightCornflowBlue3: "light cornflower blue 3",
    lightPurple3: "light purple 3",
    lightRed3: "light red 3",
    lightGray2: "light gray 2"
  },

  // A mapping of button-caption to DOM element.
  menuItemElements: {},

  // Mode can be one of:
  // * normal
  // * insert: when editing a cell's contents
  // * disabled: when the cursor is on some other form field in Sheets, like the Find dialog.
  // * replace: when "r" has been typed, and we're waiting for the user to type a character to replace the
  //   cell's contents with.
  mode: "normal",

  // This is a function that will get assigned to by ui.js. We're not referencing ui.js directly, so that we
  // can avoid a circular dependency.
  typeKeyFn: null,

  setMode(mode) {
    if (this.mode === mode) { return; }
    console.log(`Entering ${mode} mode.`);
    this.mode = mode;
    this.keyQueue = [];
  },

  enterVisualMode() { this.setMode("visual"); },

  // In this mode, entire lines are selected.
  enterVisualRowMode() {
    this.preserveSelectedColumn();
    this.selectRow();
    this.setMode("visualRow");
  },

  enterVisualColumnMode() {
    SheetActions.selectColumn();
    this.setMode("visualColumn");
  },

  // Exits the current mode and transitions to normal mode.
  exitMode() {
    switch (this.mode) {
    case "visual":
      this.unselectRow();
      this.setMode("normal");
      break;
    case "visualRow":
      this.unselectRow();
      this.restoreSelectedColumn();
      this.setMode("normal");
      break;
    case "visualColumn":
      this.unselectRow();
      this.setMode("normal");
      break;
    case "normal": // Do nothing.
      break;
    default:
      throw `Attempted to exit an unknown mode: ${this.mode}`;
      break;
    }
  },

  clickToolbarButton(captionList) {
    // Sometimes a toolbar button won't exist in the DOM until its parent has been clicked, so we click all of
    // its parents in sequence.
    for (let caption of Array.from(captionList)) {
      const el = document.querySelector(`*[aria-label='${caption}']`);
      if (!el) {
        console.log(`Couldn't find the element for the button labeled ${caption}.`);
        console.log(captionList);
        return;
      }
      KeyboardUtils.simulateClick(el);
    }
  },

  // Returns the DOM element of the menu item with the given caption. Prints a warning if a menu item isn't
  // found (since this is a common source of errors in SheetKeys) unless silenceWarning = true.
  getMenuItem(caption, silenceWarning) {
    if (silenceWarning == null) { silenceWarning = false; }
    let item = this.menuItemElements[caption];
    if (item) { return item; }
    item = this.findMenuItem(caption);
    if (!item) {
      if (!silenceWarning) { console.log(`Error: could not find menu item with caption ${caption}`); }
      return null;
    }
    return this.menuItemElements[caption] = item;
  },

  findMenuItem(caption) {
    const menuItems = document.querySelectorAll(".goog-menuitem");
    const isRegexp = caption instanceof RegExp;
    for (let menuItem of Array.from(menuItems)) {
      const label = menuItem.innerText;
      if (!label) continue;
      if (isRegexp) {
        if (caption.test(label))
          return menuItem;
      } else {
        if (label.indexOf(caption) === 0)
          return menuItem;
      }
    }
    return null;
  },

  // Returns the color palette button corresponding to the given color name.
  // type: either "font" or "cell", depending on which color you want to change.
  // Note that the availability and use of the color palette buttons is a bit finicky.
  getColorButton(color, type) {
    // First we must open the palette; only then can we reliably get the color button that pertains to that
    // color palette.
    const paletteButton = document.querySelector(
      (type == "cell") ? "*[aria-label='Fill color']": "*[aria-label='Text color']");
    KeyboardUtils.simulateClick(paletteButton);

    const rect = paletteButton.getBoundingClientRect();
    const palette = document.elementFromPoint(rect.left, rect.bottom + 10);
    if (!palette) { throw `Unable to find element for ${type} panel.` }
    const selector = `*[aria-label='${color}']`;
    const colorButton = palette.querySelector(selector);
    if (!colorButton) { throw `Couldn't find the color button with selector ${selector}`; }

    // Hide the color palette. This isn't strictly necessary because any other click on the document will also
    // result in hiding the palette.
    KeyboardUtils.simulateClick(paletteButton);

    return colorButton;
  },

  changeFontColor(color) { KeyboardUtils.simulateClick(this.getColorButton(color, "font")); },
  changeCellColor(color) { KeyboardUtils.simulateClick(this.getColorButton(color, "cell")); },

  clickMenu(itemCaption) { KeyboardUtils.simulateClick(this.getMenuItem(itemCaption)); },

  deleteRowsOrColumns() {
    this.activateMenu("Delete►");
    if (this.mode == "visualColumn")
      this.clickMenu(this.menuItems.deleteColumn);
    else
      this.clickMenu(this.menuItems.deleteRow);

    // Clear any row-level selections we might've had.
    this.unselectRow();

    // In case we're in visual mode, exit that mode and return to normal mode.
    this.setMode("normal");
  },

  preserveSelectedColumn() { this.previousColumnLeft = this.selectedCellCoords().left; },

  replaceChar() { this.setMode("replace"); },

  restoreSelectedColumn() {
    const left = this.previousColumnLeft;
    const { top } = this.selectedCellCoords();
    const el = document.elementFromPoint(left, top);
    KeyboardUtils.simulateClick(el, left, top);
  },

  selectedCellCoords() {
    const box = document.querySelector(".active-cell-border").getBoundingClientRect();
    // Offset this box by > 0 so we don't select the borders around the selected cell.
    // NOTE(philc): I've chosen 5 here instead of 1 because > 1 is required when the document is zoomed.
    const margin = 5;
    return {top: box.top + margin, left: box.left + margin};
  },

  selectRow() {
    // Sheets allows you to type Shift+Space to select a row, but its behavior is buggy, so we're avoiding it:
    // 1. Sometimes it doesn't select the whole row, so you need to type it twice.
    // 2. In some sheets, moving a row after selecting a row with shift+space deterministically causes columns
    //    to swap!

    // xOffset is 15px from the left edge of the cell border because we don't want to mistakenly click on the
    // "unhide" arrow icon which is present when spreadsheet rows are hidden.
    // TODO(philc): This approach does not work when the row grouping UI is showing (View > Group > rows)
    const xOffset = 15;
    // yOffset is set to 10 because empirically it correctly selects the row even when the page is zoomed.
    const yOffset = 10;
    const y = this.selectedCellCoords().top + yOffset;
    const rowMarginEl = document.elementFromPoint(xOffset, y);
    KeyboardUtils.simulateClick(rowMarginEl, xOffset, y);
  },

  selectColumn() {
    // Sheets allows you to type Alt+Space to select a column. Similar to `selectRow`, using that shortcut has
    // issues, so here we click on the appropriate column.
    const activeCellLeft = this.selectedCellCoords().left;
    // The column header is at the top of the grid portion of the UI (the waffle container).
    const gridTop = document.getElementById("waffle-grid-container").getBoundingClientRect().top;
    const yOffset = gridTop + 1; // +1 was chosen empirically, and is necessary when the document is zoomed.
    const colMarginEl = document.elementFromPoint(activeCellLeft, yOffset);
    KeyboardUtils.simulateClick(colMarginEl, activeCellLeft, yOffset);
  },

  unselectRow() {
    const oldY = this.cellCursorY();
    // Typing any arrow key will unselect the current selection.
    UI.typeKey(KeyboardUtils.keyCodes.downArrow);
    // If the cursor moved after we typed our arrow key, undo this selection change.
    if (oldY !== this.cellCursorY()) {
      this.typeKeyFn(KeyboardUtils.keyCodes.upArrow);
    }
  },

  cellCursorY() {
    // This is an approximate estimation of where the cell cursor is relative to the upper left corner of the
    // spreadsheet canvas.
    // Under some conditions, this selectionBox element doesn't exist. One such case is when selecting a
    // column and then moving the column.
    const selectionBox = document.querySelector(".autofill-cover");
    return selectionBox ? selectionBox.getBoundingClientRect().top : null;
  },

  //
  // Movement
  //
  moveUp() {
    const keyOptions = (this.mode == "normal") ? {} : { shift: true };
    this.typeKeyFn(KeyboardUtils.keyCodes.upArrow, keyOptions);
  },
  moveDown() {
    const keyOptions = (this.mode == "normal") ? {} : { shift: true };
    this.typeKeyFn(KeyboardUtils.keyCodes.downArrow, keyOptions);
  },
  moveLeft() {
    const keyOptions = (this.mode == "normal") ? {} : { shift: true };
    this.typeKeyFn(KeyboardUtils.keyCodes.leftArrow, keyOptions);
  },
  moveRight() {
    const keyOptions = (this.mode == "normal") ? {} : { shift: true };
    this.typeKeyFn(KeyboardUtils.keyCodes.rightArrow, keyOptions);
  },

  //
  // Row movement
  //
  moveRowsUp() {
    // In normal mode, where we have just a single cell selected, restore the column after moving the row.
    if (this.mode == "normal") { this.preserveSelectedColumn(); }
    this.selectRow(); // A row has to be selected before the "Move>" menu becomes enabled.
    this.activateMenu("Move►");
    this.clickMenu(this.menuItems.moveRowUp);
    if (this.mode == "normal") {
      SheetActions.unselectRow();
      this.restoreSelectedColumn();
    }
  },

  moveRowsDown() {
    if (this.mode == "normal") { this.preserveSelectedColumn(); }
    this.selectRow();
    this.activateMenu("Move►");
    this.clickMenu(this.menuItems.moveRowDown);
    if (this.mode == "normal") {
      SheetActions.unselectRow();
      this.restoreSelectedColumn();
    }
  },

  moveColumnsLeft() {
    this.selectColumn();
    this.activateMenu("Move►");
    this.clickMenu(this.menuItems.moveColumnLeft);
  },

  moveColumnsRight() {
    this.selectColumn();
    this.activateMenu("Move►");
    this.clickMenu(this.menuItems.moveColumnRight);
  },

  //
  // Editing
  //
  undo() { this.clickMenu(this.menuItems.undo); },
  redo() { this.clickMenu(this.menuItems.redo); },

  clear() {
    this.activateMenu("Delete►");
    this.clickMenu(this.menuItems.deleteValues);
  },

  // Creates a row below and begins editing it.
  openRowBelow() {
    this.insertRowBelow();
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);
  },

  openRowAbove() {
    this.insertRowAbove();
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);
  },

  // Like openRowBelow, but does not enter insert mode.
  insertRowBelow() {
    this.activateMenu("Rows►");
    this.clickMenu(this.menuItems.rowBelow);
  },

  insertRowAbove() {
    this.activateMenu("Rows►");
    this.clickMenu(this.menuItems.rowAbove);
  },

  changeCell() {
    this.clear();
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);
  },

  // Put the cursor at the beginning of the cell.
  editCell() {
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);
    // Note that just typing the "home" key here doesn't work, for unknown reasons.
    this.moveCursorToCellStart();
  },

  editCellAppend() {
    // Note that appending to the cell's contents is the default behavior of the Enter key in Sheets.
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);
  },

  moveCursorToCellStart() {
    // See http://stackoverflow.com/q/6249095/46237
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.setStart(range.startContainer, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  },

  moveCursorToCellLineEnd() {
    // See https://stackoverflow.com/a/3866442
    const editorEl = document.getElementById("waffle-rich-text-editor");
    const selection = window.getSelection();
    const range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(editorEl);//Select the entire contents of the element with the range
    range.collapse(false); // Collapse the range on the end point.
    selection.removeAllRanges();
    selection.addRange(range);
  },

  commitCellChanges() {
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);
    // "Enter" in Sheets moves your cursor to the cell below the one you're currently editing. Avoid that.
    this.typeKeyFn(KeyboardUtils.keyCodes.upArrow);
  },

  copyRowOrSelection() {
    if (this.mode == "normal") {
      this.selectRow();
      this.clickMenu(this.menuItems.copy);
      this.unselectRow();
    } else {
      this.clickMenu(this.menuItems.copy);
    }

  },

  copy() {
    this.clickMenu(this.menuItems.copy);
    // This is needed because clicking the copy button starts a cell selection process for some reason.
    this.unselectRow();
  },

  paste() {
    this.clickMenu(this.menuItems.paste);
    this.unselectRow();
  },

  // Merging cells
  mergeAllCells() { this.clickMenu(this.menuItems.mergeAll); },
  mergeCellsHorizontally() { this.clickMenu(this.menuItems.mergeHorizontally); },
  mergeCellsVertically() { this.clickMenu(this.menuItems.mergeVertically); },
  unmergeCells() { this.clickMenu(this.menuItems.unmerge); },

  //
  // Scrolling
  //

  // In px. Measured on a mac with Chrome's zoom level at 100%.
  rowHeight() { return 17; },

  // The approximate number of visible rows. It's probably possible to compute this precisely.
  visibleRowCount() {
     return Math.ceil(document.querySelector(".grid-scrollable-wrapper").offsetHeight / this.rowHeight());
   },

  // NOTE(philc): It would be nice to improve these scrolling commands. They're somewhat slow and imprecise.
  scrollHalfPageDown() {
    var rowCount = Math.floor(this.visibleRowCount() / 2);
    for (let i = 0; i < rowCount; i++) {
      this.typeKeyFn(KeyboardUtils.keyCodes.downArrow)
    }
  },

  scrollHalfPageUp() {
    var rowCount = Math.floor(this.visibleRowCount() / 2);
    for (let i = 0; i < rowCount; i++) {
      this.typeKeyFn(KeyboardUtils.keyCodes.upArrow)
    }
  },

  scrollToTop() {
    // TODO(philc): This may not work on Linux or Windows since it uses the meta key. Replace with CTRL on
    // those platforms?
    this.typeKeyFn(KeyboardUtils.keyCodes.home, {meta: true});
  },

  scrollToBottom() {
    // End takes you to the bottom-right corner of the sheet, which doesn't mirror gg. So use Left afterwards.
    this.typeKeyFn(KeyboardUtils.keyCodes.end, {meta: true});
    this.typeKeyFn(KeyboardUtils.keyCodes.leftArrow, {meta: true});
  },

  //
  // Tabs
  //
  getTabEls() { return document.querySelectorAll(".docs-sheet-tab"); },
  getActiveTabIndex() {
    const iterable = this.getTabEls();
    for (let i = 0; i < iterable.length; i++) {
      const tab = iterable[i];
      if (tab.classList.contains("docs-sheet-active-tab")) { return i; }
    }
    return null;
  },

  moveTabRight() { this.clickTabButton("Move right"); },
  moveTabLeft() { this.clickTabButton("Move left"); },

  prevTab() {
    const tabs = this.getTabEls();
    const prev = this.getActiveTabIndex() - 1;
    if (prev < 0) { return; }
    KeyboardUtils.simulateClick(tabs[prev]);
  },

  nextTab() {
    const tabs = this.getTabEls();
    const next = this.getActiveTabIndex() + 1;
    if (next >= tabs.length) { return; }
    KeyboardUtils.simulateClick(tabs[next]);
  },

  clickTabButton(buttonCaption) {
    const menu = document.querySelector(".docs-sheet-tab-menu");
    // This tab menu element gets created the first time the user clicks on it, so it may not yet be available
    // in the DOM.
    if (!menu) { this.activateTabMenu(); }
    const menuItems = document.querySelectorAll(".docs-sheet-tab-menu .goog-menuitem");
    let result = null;
    for (let item of Array.from(menuItems)) {
      if (item.innerText.indexOf(buttonCaption) === 0) {
        result = item;
        break;
      }
    }
    if (!result) {
      console.log(`Couldn't find a tab menu item with the caption ${buttonCaption}`);
      return;
    }
    KeyboardUtils.simulateClick(result);
  },

  // Shows and then hides a submenu in the File menu system. This triggers creation of the buttons in that
  // submenu, so they can be clicked.
  activateMenu(menuCaption) {
    const menuButton = this.getMenuItem(menuCaption);
    KeyboardUtils.simulateClick(menuButton);
    // Once the submenu is shown, it can only be hidden by modifying its style attribute.
    // It's not possible to identify and find the specific submenu DOM element that was created and shown as a
    // result of clicking on the menuButton, so we brute force hide all menus.
    const menus = Array.from(document.querySelectorAll(".goog-menu"));
    for (const m of menus)
      m.style.display = "none";
  },

  // Shows and then hides the tab menu for the currently selected tab.
  // This has the side effect of forcing Sheets to create the menu DOM element if it hasn't yet been created.
  activateTabMenu() {
    const menuButton = document.querySelector(".docs-sheet-active-tab .docs-icon-arrow-dropdown");
    // Show and then hide the tab menu.
    KeyboardUtils.simulateClick(menuButton);
    KeyboardUtils.simulateClick(menuButton);
  },

  //
  // Formatting
  //

  // NOTE(philc): I couldn't reliably detect the selected font size for the current cell, and so I couldn't
  // implement increaes font / decrease font commands.
  // TODO(philc): I believe this is now possible. It's held in #docs-font-size.
  getFontSizeMenu() { return this.getMenuItem("6").parentNode; },

  setFontSize10() {
    this.activateMenu(this.menuItems.fontSizeMenu);
    KeyboardUtils.simulateClick(this.getMenuItem(/^10$/));
  },

  setFontSize8() {
    this.activateMenu(this.menuItems.fontSizeMenu);
    KeyboardUtils.simulateClick(this.getMenuItem(/^8$/));
  },

  wrap() { this.clickToolbarButton(this.buttons.wrap); },
  overflow() { this.clickToolbarButton(this.buttons.overflow); },
  clip() { this.clickToolbarButton(this.buttons.clip); },
  alignLeft() { this.clickToolbarButton(this.buttons.left); },
  alignCenter() { this.clickToolbarButton(this.buttons.center); },
  alignRight() { this.clickToolbarButton(this.buttons.right); },
  colorCellWhite() { this.changeCellColor(this.colors.white); },
  colorCellLightYellow3() { this.changeCellColor(this.colors.lightYellow3); },
  colorCellLightCornflowerBlue3() { this.changeCellColor(this.colors.lightCornflowBlue3); },
  colorCellLightPurple() { this.changeCellColor(this.colors.lightPurple3); },
  colorCellLightRed3() { this.changeCellColor(this.colors.lightRed3); },
  colorCellLightGray2() { this.changeCellColor(this.colors.lightGray2); },

  freezeRow() {
    this.activateMenu("Freeze►");
    this.clickMenu(this.menuItems.freezeRow); // This forces the creation of the sub-menu items.
  },

  freezeColumn() {
    this.activateMenu("Freeze►");
    this.clickMenu(this.menuItems.freezeColumn); // This forces the creation of the sub-menu items.
  },

  //
  // Misc
  //

  toggleFullScreen() {
    this.clickMenu(this.menuItems.fullScreen);
    // After entering full-screen mode, immediately dismiss the notification the Google Docs shows.
    // Note that the DOM element is only available a second after toggling fullscreen.
    setTimeout(() => this.dismissFullScreenNotificationMessage(), 250);
  },

  dismissFullScreenNotificationMessage() {
    // There should only be one dismiss button, but just in case there's ever multiple, click on all of them.
    // Another reasonable behavior is to click on none of them, since one of these buttons is likely for a
    // notification that's not the fullscreen dismiss button.
    const dismissButtons = document.querySelectorAll(".docs-butterbar-dismiss");
    for (let button of dismissButtons)
      KeyboardUtils.simulateClick(button);
  },

  // Opens a new tab for each link in the current cell.
  openCellAsUrl() {
    // Focus the current cell, which causes the <a> elements to appear in the formula bar DOM:
    this.typeKeyFn(KeyboardUtils.keyCodes.enter);

    const formulaBar = document.querySelector("#t-formula-bar-input-container .cell-input");
    const embeddedLinks = formulaBar.querySelectorAll("a");
    // Case 1: Embedded links
    if (embeddedLinks.length > 0) {
      embeddedLinks.forEach((el) => {
        console.log(el);
        console.log(el.dataset.sheetsFormulaBarTextLink);
        window.open(el.dataset.sheetsFormulaBarTextLink, "_blank");
      });
    } else {
      const text = formulaBar.textContent.trim();
      const functionMatch = text.match(/HYPERLINK\("(.+?)"[^"]+".+?"\)/i);
      // Case 2: Usage of the 'HYPERLINK("url", "caption")' function
      if (functionMatch) {
        window.open(functionMatch[1], "_blank");
      } else {
        const urlMatches = text.match(/(https?:\/\/[^\s]+)/g);
        // Case 3: Raw link(s) in the cell's plain text
        if (urlMatches) {
          urlMatches.forEach((url) => { window.open(url, "_blank"); });
        }
      }
    }

    // Finally, unfocus the current cell:
    this.commitCellChanges();
  },

  async showHelpDialog() {
    UI.ignoreKeys = true;
    const h = new HelpDialog();
    h.addEventListener("hide", () => {
      UI.ignoreKeys = false;
    });
    await h.show();
  },

  reloadPage() { window.location.reload(); }
};

window.SheetActions = SheetActions;
