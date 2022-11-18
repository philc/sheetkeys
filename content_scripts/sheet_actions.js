SheetActions = {
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
    pasteFormulaOnly: "Formula only",
    // undo: "Undo",
    undo: "Undo⌘Z",
    // redo: "Redo",
    redo: "Redo⌘Y",
    fullScreen: "Full screen",
    mergeAll: "Merge all",
    mergeHorizontally: "Merge horizontally",
    mergeVertically: "Merge vertically",
    unmerge: "Unmerge",
    // Custom 'Rishi' menu
    numberDollar2: "$ $0.00",
    filterToggle: "Filter toggle",
    fitlerOnActiveCell: "Filter on active cell",
    removeAllFilters: "Remove all filters",
  },

  buttons: {
    center: ["Horizontal align", "Center"],
    clip: ["Text wrapping", "Clip"],
    left: ["Horizontal align", "Left"],
    right: ["Horizontal align", "Right"],
    overflow: ["Text wrapping", "Overflow"],
    wrap: ["Text wrapping", "Wrap"],
    borderTop: ["Borders", "Top border"],
    // borderBottom: ["Borders", "Bottom border"],
    borderLeft: ["Borders", "Left border"],
    borderRight: ["Borders", "Right border"],
    borderClear: ["Borders", "Clear borders"],
    decimalDecrease: ["Decrease decimal places"],
    decimalIncrease: ["Increase decimal places"],
    deleteColumns: ["Delete", "Column"],
    // pasteFormulaOnly: ["Paste special s", "Formula only"],
  },

  // You can find the names of these color swatches by hovering over the swatches and seeing the tooltip.
  colors: {
    white: "white",
    lightYellow3: "light yellow 3",
    lightCornflowBlue3: "light cornflower blue 3",
    lightBlue3: "light blue 3",
    lightPurple3: "light purple 3",
    lightRed3: "light red 3",
    lightGray2: "light gray 2",
    blue: "blue",
    red: "red",
    darkRed: "red berry",
    blue: "blue",
    black: "black",
    yellow: "yellow",
  },

  // A mapping of button-caption to DOM element.
  menuItemElements: {},

  clickToolbarButton(captionList) {
    // Sometimes a toolbar button won't exist in the DOM until its parent has been clicked, so we click all of
    // its parents in sequence.
    for (let caption of Array.from(captionList)) {
      const el = document.querySelector(`*[aria-label='${caption}']`);
      if (!el) {
        console.log(`Couldn't find the element for the button labeled "${caption}".`);
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

    // If already cached, return it
    let item = this.menuItemElements[caption];
    if (item) {
      console.log(`Found menu item from cache: "${caption}"`)
      return item;
    }

    // Otherwise find it
    item = this.findMenuItem(caption);
    if (!item) {
      if (!silenceWarning) { console.log(`Error: could not find menu item with caption ${caption}`); }
      return null;
    }
    console.log(`Found menu item from DOM search: "${caption}"`)
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

  findMenuRootButton(caption) {
    const menuItems = document.querySelectorAll(".menu-button");
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

  // Returns the color border button corresponding to the border name, ie "Bottom border"
  // ex: Top border
  // ex: Bottom border
  clickBorderButton(borderType) {
    // Click toolbar  button first
    const toolbarSelector = `*[aria-label='Borders']`;
    const toolbarButton = document.querySelector(toolbarSelector);
    KeyboardUtils.simulateClick(toolbarButton);

    // Then click submenu button for actual border type
    const selector = `*[aria-label='${borderType}']`;
    const borderButton = document.querySelector(selector);
    if (!borderButton) {
      throw `Couldn't find the border button with selector ${selector}`;
    }

    // Click the toolbar button again to close it
    KeyboardUtils.simulateClick(toolbarButton);
    // Click border button AFTER when its in hidden state
    // TODO: Button remains selected, inlike in getColorButton, not sure why
    KeyboardUtils.simulateClick(borderButton);
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

    // Get the element for the palette dropdown
    const rect = paletteButton.getBoundingClientRect();
    const palette = document.elementFromPoint(rect.left, rect.bottom + 10);
    if (!palette) { throw `Unable to find element for ${ type } panel.` }

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

  clickMenu(itemCaption) {
    console.log(`Called clickMenu(): "${itemCaption}"`)
    KeyboardUtils.simulateClick(this.getMenuItem(itemCaption));
  },

  clickRootMenuItem(rootMenuCaption, itemCaption) {
    console.log(`Clicking root menu item: ${rootMenuCaption} → ${itemCaption}`)
    // Manually get the top level menu to open to prevent the hanging modal
    const el = Array.from(document.querySelectorAll(".menu-button"))
      .find(el => el.textContent === rootMenuCaption);
    KeyboardUtils.simulateClick(el);
    // Click the submenu buttons
    this.clickMenu(itemCaption);
  },

  createRishiMenuSubMenu() {
    // NOTE: Must double click the Rishi menu the first time to create the submenu
    KeyboardUtils.simulateClick(this.findMenuRootButton("Rishi"));
  },

  createAlbertMenuSubMenu() {
    // NOTE: Must double click the Rishi menu the first time to create the submenu
    KeyboardUtils.simulateClick(this.findMenuRootButton("Albert"));
  },

  deleteColumns() {
    this.clickMenu(this.menuItems.deleteColumn);
    // Clear any row-level selections we might've had.
    this.unselectRow();
  },

  deleteRowsOrColumns() {
    this.activateMenu("Delete►");
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
    // spreadsheet canvas.
    // Under some conditions, this selectionBox element doesn't exist. One such case is when selecting a
    // column and then moving the column.
    const selectionBox = document.querySelector(".autofill-cover");
    return selectionBox ? selectionBox.getBoundingClientRect().top : null;
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

  moveEndDownAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.downArrow, { shift: true, meta: true }); },
  moveEndUpAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.upArrow, {shift: true, meta: true}); },
  moveEndLeftAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.leftArrow, {shift: true, meta: true}); },
  moveEndRightAndSelect() { UI.typeKey(KeyboardUtils.keyCodes.rightArrow, { shift: true, meta: true }); },

  copyEndDownAndCopy() {
    UI.typeKey(KeyboardUtils.keyCodes.downArrow, { shift: true, meta: true });
    UI.typeKey(KeyboardUtils.keyCodes.d, { shift: false, meta: true });
  },

  openCommandPalette() {
    var el = document.querySelector(`*[placeholder='Search the menus (Option+/)']`);
    KeyboardUtils.simulateClick(el);
  },

  openSearch() {
    // NOT WORKING -- Attempted to prepopulate search with active call
    // this.clickMenu(this.menuItems.copy);
    // UI.typeKey(KeyboardUtils.keyCodes.c, { meta: true });
    UI.typeKey(KeyboardUtils.keyCodes.f, { meta: true });
    // document.getElementsByClassName('docs-findinput-input')[0].click()
    // UI.typeKey(KeyboardUtils.keyCodes.v, { meta: true });
  },

  openTabsList() {
    console.log('Opening tabs list')
    var el = document.querySelectorAll(".docs-sheet-all").item(0)
    KeyboardUtils.simulateClick(el);
  },

  //
  // Row movement
  //
  moveRowsUp() {
    // In normal mode, where we have just a single cell selected, restore the column after moving the row.
    if (UI.mode === "normal") { this.preserveSelectedColumn(); }
    this.selectRow(); // A row has to be selected before the "Move>" menu becomes enabled.
    this.activateMenu("Move►");
    this.clickMenu(this.menuItems.moveRowUp);
    if (UI.mode === "normal") {
      SheetActions.unselectRow();
      this.restoreSelectedColumn();
    }
  },

  moveRowsDown() {
    if (UI.mode === "normal") { this.preserveSelectedColumn(); }
    this.selectRow();
    this.activateMenu("Move►");
    this.clickMenu(this.menuItems.moveRowDown);
    if (UI.mode === "normal") {
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
      // UI.typeKey(KeyboardUtils.keyCodes.enter);
    },

  openRowAbove() {
      this.insertRowAbove();
      // UI.typeKey(KeyboardUtils.keyCodes.enter);
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
    console.log('Calling SheetActions.copy()');
    this.clickMenu(this.menuItems.copy);
    this.unselectRow();
  },

  paste() {
    this.clickMenu(this.menuItems.paste);
    this.unselectRow();

    // Alternative -- does not work
    // console.log('paste via keyboard shortcut!');
    // UI.typeKey(KeyboardUtils.keyCodes.v, { meta: true });
  },

  pasteFormatOnly() {
    console.log('paste format only!');
    UI.typeKey(KeyboardUtils.keyCodes.v, { alt: true, meta: true });
  },

  pasteValuesOnly() {
    console.log('Paste values only!');
    UI.typeKey(KeyboardUtils.keyCodes.v, { shift: true, meta: true });
  },

  pasteFormulaOnly() {
    this.activateMenu("Paste special►");
    this.clickMenu(this.menuItems.pasteFormulaOnly);
  },


  // Merging cells
  mergeAllCells() { this.clickMenu(this.menuItems.mergeAll); },
  mergeCellsHorizontally() { this.clickMenu(this.menuItems.mergeHorizontally); },
  mergeCellsVertically() { this.clickMenu(this.menuItems.mergeVertically); },
  unmergeCells() { this.clickMenu(this.menuItems.unmerge); },

  // Filtering
  filterToggle() {
    // this.createRishiMenuSubMenu()
    this.createAlbertMenuSubMenu()
    this.clickMenu(this.menuItems.filterToggle);
  },

  fitlerOnActiveCell() {
    // this.createRishiMenuSubMenu()
    // this.createAlbertMenuSubMenu()
    this.clickMenu(this.menuItems.fitlerOnActiveCell);
  },

  removeAllFilters() {
    // this.createRishiMenuSubMenu()
    // this.createAlbertMenuSubMenu()
    this.clickMenu(this.menuItems.removeAllFilters);
  },

  //
  // Scrolling
  //

  // In px. Measured on a mac with Chrome's zoom level at 100%.
  rowHeight() { return 17; },

  // The approximate number of visible rows. It's probably possible to compute this precisely.
  visibleRowCount() {
     return Math.ceil(document.querySelector(".grid-scrollable-wrapper").offsetHeight / this.rowHeight());
   },

  moveEndDown() { UI.typeKey(KeyboardUtils.keyCodes.downArrow, {meta: true}) },
  moveEndUp() { UI.typeKey(KeyboardUtils.keyCodes.upArrow, {meta: true}) },
  moveEndRight() { UI.typeKey(KeyboardUtils.keyCodes.rightArrow, {meta: true}) },
  moveEndLeft() { UI.typeKey(KeyboardUtils.keyCodes.leftArrow, {meta: true}) },

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
  getZoomMenu() { return this.getMenuItem("100%").parentNode; },

  activateFontSizeMenu() {
    //  KeyboardUtils.simulateClick(this.getMenuItem("Font size"));
     KeyboardUtils.simulateClick(this.getMenuItem("Font size►"));
     // It's been shown; hide it again.
     this.getFontSizeMenu().style.display = "none";
   },

  activateZoomMenu() {
     KeyboardUtils.simulateClick(this.getMenuItem("Zoom►"));
     // It's been shown; hide it again.
     this.getZoomMenu().style.display = "none";
   },

  setFontSize10() {
    this.activateFontSizeMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("10"));
    console.log('Font size 10');
  },

  setFontSize8() {
    this.activateFontSizeMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("8"));
    console.log('Font size 8');
  },

  setFontSize12() {
    this.activateFontSizeMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("12"));
    console.log('Font size 12');
  },

  setZoom75() {
    this.activateZoomMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("75%"));
    console.log('Zoom 75%');
  },

  setZoom90() {
    this.activateZoomMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("90%"));
    console.log('Zoom 90%');
  },

  setZoom100() {
    this.activateZoomMenu();
    KeyboardUtils.simulateClick(this.getMenuItem("100%"));
    console.log('Zoom 100%');
  },

  // Format numbers
  numberFormatNumber2() {
    UI.typeKey(KeyboardUtils.keyCodes.number1, { shift: true, control: true });
  },

  numberFormatDollar2() {
    UI.typeKey(KeyboardUtils.keyCodes.number4, { shift: true, control: true });
    // this.clickMenu(this.menuItems.numberDollar2);
  },

  numberFormatPercent2() {
    UI.typeKey(KeyboardUtils.keyCodes.number5, { shift: true, control: true });s
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
  colorCellYellow() { this.changeCellColor(this.colors.yellow); },
  colorCellLightCornflowerBlue3() { this.changeCellColor(this.colors.lightCornflowBlue3); },
  colorCellLightBlue3() { this.changeCellColor(this.colors.lightBlue3); },
  colorCellLightPurple() { this.changeCellColor(this.colors.lightPurple3); },
  colorCellLightRed3() { this.changeCellColor(this.colors.lightRed3); },
  colorCellLightGray2() { this.changeCellColor(this.colors.lightGray2); },

  borderTop() { this.clickToolbarButton(this.buttons.borderTop); },
  borderBottom() {
    this.clickBorderButton("Bottom border");
    // this.commitCellChanges();
  },
  borderRight() { this.clickToolbarButton(this.buttons.borderRight); },
  borderLeft() { this.clickToolbarButton(this.buttons.borderLeft); },
  borderClear() { this.clickToolbarButton(this.buttons.borderClear); },

  decimalDecrease() { this.clickToolbarButton(this.buttons.decimalDecrease); },
  decimalIncrease() { this.clickToolbarButton(this.buttons.decimalIncrease); },

  // Font color
  colorCellFontColorRed() { this.changeFontColor(this.colors.red); },
  colorCellFontColorDarkRed() { this.changeFontColor(this.colors.darkRed); },
  colorCellFontColorBlue() { this.changeFontColor(this.colors.blue); },
  colorCellFontColorBlack() { this.changeFontColor(this.colors.black); },

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

  // Returns the value of the current cell.
  getCellValue() { return document.querySelector("#t-formula-bar-input-container").textContent; },

  // Opens a new tab using the current cell's value as the URL.
  openCellAsUrl() {
    let url = this.getCellValue().trim();
    // Some cells can contain a HYPERLINK("url", "caption") value. If so, assume that's the URL to open.
    const match = url.match(/HYPERLINK\("(.+?)"[^"]+".+?"\)/i);
    if (match) { url = match[1]; }
    window.open(url, "_blank");
  }
};
