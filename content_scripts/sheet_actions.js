SheetActions = {
  menuItems: {
    copy: "MenuItemsCopy",
    // This string with a space at the end is meant to match the button "Delete row X" where x is some number.
    // There is also a "Delete rows/columns" button which we do not want to match.
    deleteRow: "MenuItemsDeleteRow",
    deleteColumn: "MenuItemsDeleteColumn",
    deleteValues: "MenuItemsDeleteValues",
    rowAbove: "MenuItemsRowAbove",
    rowBelow: "MenuItemsRowBelow",
    freeze: "MenuItemsFreeze", // Clicking this creates a sub-menu.

    freezeRow: "MenuItemsUpToCurrentRow", // This is a sub-item of the "Freeze" menu.

    freezeColumn: "MenuItemsUpToCurrentColumn", // This is a sub-item of the "Freeze" menu.

    // The "moveRowUp" menu item won't yet exist if multiple rows are selected.
    moveRowUp: "MenuItemsMoveRowUp",
    moveRowDown: "MenuItemsMoveRowDown",
    moveRowsUp: "MenuItemsMoveRowsUp",
    moveRowsDown: "MenuItemsMoveRowsDown",
    moveColumnLeft: "MenuItemsMoveColumnLeft",
    moveColumnRight: "MenuItemsMoveColumnRight",
    moveColumnsLeft: "MenuItemsMoveColumnsLeft",
    moveColumnsRight: "MenuItemsMoveColumnsRight",
    paste: "MenuItemsPaste",
    undo: "MenuItemsUndo",
    redo: "MenuItemsRedo",
    fullScreen: "MenuItemsFullScreen",
    mergeAll: "MenuItemsMergeAll",
    mergeHorizontally: "MenuItemsMergeHorizontally",
    mergeVertically: "MenuItemsMergeVertically",
    unmerge: "MenuItemsUnmerge",
  },

  buttons: {
    center: ["ButtonsHorizontalAlign", "Center"],
    clip: ["ButtonsTextWrapping", "Clip"],
    left: ["ButtonsHorizontalAlign", "Left"],
    right: ["ButtonsHorizontalAlign", "Right"],
    overflow: ["ButtonsTextWrapping", "Overflow"],
    wrap: ["ButtonsTextWrapping", "Wrap"]
  },

  // You can find the names of these color swatches by hoverig over the swatches and seeing the tooltip.
  colors: {
    white: "ColorWhite",
    lightYellow3: "ColorLightYellow3",
    lightCornflowBlue3: "ColorLightCornflowerBlue3",
    lightPurple3: "ColorLightPurple3",
    lightRed3: "ColorLightRed3",
    lightGray2: "ColorLightGray2"
  },

  // A mapping of button-caption to DOM element.
  menuItemElements: {},
  
  clickToolbarButton(captionList) {
    // Sometimes a toolbar button won't exist in the DOM until its parent has been clicked, so we click all of
    // its parents in sequence.
    for (let captionOrI18nMessage of Array.from(captionList)) {
      const caption = this.getI18nMessag(captionOrI18nMessage);
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
  getMenuItem(captionOrI18nMessageKey, silenceWarning) {
    const caption = this.getI18nMessag(captionOrI18nMessageKey);
    if (silenceWarning == null) { silenceWarning = false; }
    let item = this.menuItemElements[caption];
    if (item) { return item; }
    item = this.findMenuItem(caption);
    if (!item) {
      if (!silenceWarning) { console.log(`Warning: could not find menu item with caption ${caption}`); }
      return null;
    }
    return this.menuItemElements[caption] = item;
  },

  findMenuItem(caption) {
    return this.findItem(".goog-menuitem", caption);
  },

  findItem(selector, caption) {
    const menuItems = document.querySelectorAll(selector);
    const regexp = new RegExp(caption);
    for (let menuItem of Array.from(menuItems)) {
      const label = menuItem.innerText;
      if( label && label.search(regexp) === 0 ) {
        return menuItem;
      }
    }
    return null;
  },

  // Returns the color palette button corresponding to the given color name.
  // type: either "font" or "cell", depending on which color you want to change.
  // Note that the availability and use of the color palette buttons is a bit finicky.
  getColorButton(colorOrI18nMessageKey, type) {
    const color = this.getI18nMessag(colorOrI18nMessageKey);
    // First we must open the palette; only then can we reliably get the color button that pertains to that
    // color palette.
    const paletteButton = document.querySelector(
      (type == "cell") ? `*[aria-label='${this.getI18nMessag("ButtonsFillColor")}']`: `*[aria-label='${this.getI18nMessag("ButtonsTextColor")}']`);
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
    if (UI.mode == "visualColumn")
      this.clickMenu(this.menuItems.deleteColumn);
    else
      this.clickMenu(this.menuItems.deleteRow);

    // Clear any row-level selections we might've had.
    this.unselectRow();
  },

  preserveSelectedColumn() { this.previousColumnLeft = this.selectedCellCoords().left; },

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
    // Sheets allows you to type Shift+Space to select a row, but its behavior is buggy:
    // 1. Sometimes it doesn't select the whole row, so you need to type it twice.
    // 2. In some sheets, moving a row after selecting a row with shift+space deterministically causes columns
    //    to swap!

    // xOffset is 15px from the left edge of the cell border because we don't to mistakenly click on the
    // "unhide" arrow icon which is present when spreadsheet rows are hidden.
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
      UI.typeKey(KeyboardUtils.keyCodes.upArrow);
    }
  },

  cellCursorY() {
    // This is an approximate estimation of where the cell cursor is relative to the upper left corner of the
    // sptreasheet canvas.
    return document.querySelector(".autofill-cover").getBoundingClientRect().top;
  },

  //
  // Movement
  //
  moveUp() { UI.typeKey(KeyboardUtils.keyCodes.upArrow); },
  moveDown() { UI.typeKey(KeyboardUtils.keyCodes.downArrow); },
  moveLeft() { UI.typeKey(KeyboardUtils.keyCodes.leftArrow); },
  moveRight() { UI.typeKey(KeyboardUtils.keyCodes.rightArrow); },

  moveDownAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.downArrow, {shift: true}); },
  moveUpAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.upArrow, {shift: true}); },
  moveLeftAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.leftArrow, {shift: true}); },
  moveRightAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.rightArrow, {shift: true}); },

  //
  // Row movement
  //
  moveRowsUp() {
    // In normal mode, where we have just a single cell selected, restore the column after moving the row.
    if (UI.mode === "normal") { this.preserveSelectedColumn(); }
    this.selectRow();
    if (this.getMenuItem(this.menuItems.moveRowUp, true)) {
      this.clickMenu(this.menuItems.moveRowUp);
    } else {
      this.clickMenu(this.menuItems.moveRowsUp);
    }
    if (UI.mode === "normal") {
      SheetActions.unselectRow();
      this.restoreSelectedColumn();
    }
  },

  moveRowsDown() {
    if (UI.mode === "normal") { this.preserveSelectedColumn(); }
    this.selectRow();
    if (this.getMenuItem(this.menuItems.moveRowDown, true)) {
      this.clickMenu(this.menuItems.moveRowDown);
    } else {
      this.clickMenu(this.menuItems.moveRowsDown);
    }

    if (UI.mode === "normal") {
      SheetActions.unselectRow();
      this.restoreSelectedColumn();
    }
  },

  moveColumnsLeft() {
    this.selectColumn();
    if (this.getMenuItem(this.menuItems.moveColumnLeft, true)) {
      this.clickMenu(this.menuItems.moveColumnLeft);
    } else {
      this.clickMenu(this.menuItems.moveColumnsLeft);
    }
  },

  moveColumnsRight() {
    this.selectColumn();
    if (this.getMenuItem(this.menuItems.moveColumnRight, true)) {
      this.clickMenu(this.menuItems.moveColumnRight);
    } else {
      this.clickMenu(this.menuItems.moveColumnsRight);
    }
  },

  //
  // Editing
  //
  undo() { this.clickMenu(this.menuItems.undo); },
  redo() { this.clickMenu(this.menuItems.redo); },

  clear() { this.clickMenu(this.menuItems.deleteValues); },

  // Creates a row below and begins editing it.
  openRowBelow() {
    this.clickMenu(this.menuItems.rowBelow);
    UI.typeKey(KeyboardUtils.keyCodes.enter);
  },

  openRowAbove() {
    this.clickMenu(this.menuItems.rowAbove);
    UI.typeKey(KeyboardUtils.keyCodes.enter);
  },

  // Like openRowBelow, but does not enter insert mode.
  insertRowBelow() { this.clickMenu(this.menuItems.rowBelow); },
  insertRowAbove() { this.clickMenu(this.menuItems.rowAbove); },

  changeCell() {
    this.clear();
    UI.typeKey(KeyboardUtils.keyCodes.enter);
  },

  // Put the cursor at the beginning of the cell.
  editCell() {
    UI.typeKey(KeyboardUtils.keyCodes.enter);
    // Note that just typing the "home" key here doesn't work, for unknown reasons.
    this.moveCursorToCellStart();
  },

  editCellAppend() {
    // Note that appending to the cell's contents is the default behavior of the Enter key in Sheets.
    UI.typeKey(KeyboardUtils.keyCodes.enter);
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
    UI.typeKey(KeyboardUtils.keyCodes.enter);
    // "Enter" in Sheets moves your cursor to the cell below the one you're currently editing. Avoid that.
    UI.typeKey(KeyboardUtils.keyCodes.upArrow);
  },

  copyRow() {
    this.selectRow();
    this.clickMenu(this.menuItems.copy);
    this.unselectRow();
  },

  copy() {
    this.clickMenu(this.menuItems.copy);
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
      UI.typeKey(KeyboardUtils.keyCodes.downArrow)
    }
  },

  scrollHalfPageUp() {
    var rowCount = Math.floor(this.visibleRowCount() / 2);
    for (let i = 0; i < rowCount; i++) {
      UI.typeKey(KeyboardUtils.keyCodes.upArrow)
    }
  },

  scrollToTop() {
    // TODO(philc): This may not work on Linux or Windows since it uses the meta key. Replace with CTRL on
    // those platforms?
    UI.typeKey(KeyboardUtils.keyCodes.home, {meta: true});
  },

  scrollToBottom() {
    // End takes you to the bottom-right corner of the sheet, which doesn't mirror gg. So use Left afterwards.
    UI.typeKey(KeyboardUtils.keyCodes.end, {meta: true});
    UI.typeKey(KeyboardUtils.keyCodes.leftArrow, {meta: true});
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

  moveTabRight() { this.clickTabButton("TabMoveRight"); },
  moveTabLeft() { this.clickTabButton("TabMoveLeft"); },

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

  clickTabButton(captionOrI18nMessageKey) {
    KeyboardUtils.simulateClick(this.getTabButton(captionOrI18nMessageKey));
  },

  getTabButton(captionOrI18nMessageKey) {
    const caption = this.getI18nMessag(captionOrI18nMessageKey);
    const menu = document.querySelector(".docs-sheet-tab-menu");
    // This tab menu element gets created the first time the user clicks on it, so it may not yet be available
    // in the DOM.
    if (!menu) { this.activateTabMenu(); }
    const result = this.findItem(".docs-sheet-tab-menu .goog-menuitem", caption);
    if (!result) {
      console.log(`Couldn't find a tab menu item with the caption ${buttonCaption}`);
      return;
    }
    return result;
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
  getFontSizeMenu() { return this.getMenuItem("6").parentNode; },
  activateFontSizeMenu() {
     KeyboardUtils.simulateClick(this.getMenuItem("FontSize"));
     // It's been shown; hide it again.
     this.getFontSizeMenu().style.display = "none";
   },

  setFontSize10() {
    this.activateFontSizeMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("^10$"));
  },

  setFontSize8() {
    this.activateFontSizeMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("^8$"));
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
    this.clickMenu(this.menuItems.freeze); // This forces the creation of the sub-menu items.
    const caption = this.menuItems.freezeRow;
    this.clickMenu(caption);
    // Hide the Freeze menu. Clicking the "Freeze" button again does not hide it.
    const menuItem = this.getMenuItem(caption);
    const menu = menuItem.closest(".goog-menu");
    menu.style.display = "none";
  },

  freezeColumn() {
    this.clickMenu(this.menuItems.freeze); // This forces the creation of the sub-menu items.
    const caption = this.menuItems.freezeColumn;
    this.clickMenu(caption);
    // Hide the Freeze menu. Clicking the "Freeze" button again does not hide it.
    const menuItem = this.getMenuItem(caption);
    const menu = menuItem.closest(".goog-menu");
    menu.style.display = "none";
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
    const dismissButton = document.querySelector("#docs-butterbar-container .docs-butterbar-link");
    // Ensure we don't accidentally find and click on another HUD notification which is not for dismissing
    // the full screen notification.
    if (dismissButton && dismissButton.innerText === "Dismiss") {
      KeyboardUtils.simulateClick(dismissButton);
    }
  },

  // Returns the value of the current cell.
  getCellValue() { return document.querySelector("#t-formula-bar-input-container").textContent; },

  // Opens a new tab using the current cell's value as the URL.
  openCellAsUrl() {
    let url = this.getCellValue().trim();
    // Some cells can contain a HYPERLINK("url", "caption") value. If so, assume that's the URL to open.
    const match = url.match(/HYPERLINK\("(.+?)"[^"]+".+?"\)/i);
    if (match) { url = match[1]; }
    window.open(url, "_blank");
  },

  getI18nMessag(captionOrKey) {
    return chrome.i18n.getMessage(captionOrKey) || captionOrKey
  }

};
