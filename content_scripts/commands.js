const Commands = {
  // This character is U+0095, and is used as a separator in the string representation of a sequence of keys.
  // It cannot itself appear as a key.
  KEY_SEPARATOR: "•",

  // Commands will appear in the help dialog, grouped by "group", in the order that they're defined in this
  // map.
  commands: {
    // Cursor movement
    moveUp: {
      fn: SheetActions.moveUp.bind(SheetActions),
      name: "Move up",
      group: "movement"
    },
    moveDown: {
      fn: SheetActions.moveDown.bind(SheetActions),
      name: "Move down",
      group: "movement"
    },
    moveLeft: {
      fn: SheetActions.moveLeft.bind(SheetActions),
      name: "Move left",
      group: "movement"
    },
    moveRight: {
      fn: SheetActions.moveRight.bind(SheetActions),
      name: "Move right",
      group: "movement"
    },

    // Row & column movement
    moveRowsDown: {
      fn: SheetActions.moveRowsDown.bind(SheetActions),
      name: "Move rows down",
      group: "movement"
    },
    moveRowsUp: {
      fn: SheetActions.moveRowsUp.bind(SheetActions),
      name: "Move rows up",
      group: "movement"
    },
    moveColumnsLeft: {
      fn: SheetActions.moveColumnsLeft.bind(SheetActions),
      name: "Move columns left",
      group: "movement"
    },
    moveColumnsRight: {
      fn: SheetActions.moveColumnsRight.bind(SheetActions),
      name: "Move columns right",
      group: "movement"
    },

    // Editing
    editCell: {
      fn: SheetActions.editCell.bind(SheetActions),
      name: "Edit cell",
      group: "editing"
    },
    editCellAppend: {
      fn: SheetActions.editCellAppend.bind(SheetActions),
      name: "Append to cell",
      group: "editing"
    },
    undo: {
      fn: SheetActions.undo.bind(SheetActions),
      name: "Undo",
      group: "editing"
    },
    redo: {
      fn: SheetActions.redo.bind(SheetActions),
      name: "Redo",
      group: "editing"
    },
    replaceChar: {
      fn: SheetActions.replaceChar.bind(SheetActions),
      name: "Replace",
      group: "editing"
    },
    openRowBelow: {
      fn: SheetActions.openRowBelow.bind(SheetActions),
      name: "Add and edit row below",
      group: "editing"
    },
    openRowAbove: {
      fn: SheetActions.openRowAbove.bind(SheetActions),
      name: "Add and edit row above",
      group: "editing"
    },
    insertRowBelow: {
      fn: SheetActions.insertRowBelow.bind(SheetActions),
      name: "Insert row below",
      group: "editing"
    },
    insertRowAbove: {
      fn: SheetActions.insertRowAbove.bind(SheetActions),
      name: "Insert row above",
      group: "editing"
    },
    deleteRowsOrColumns: {
      fn: SheetActions.deleteRowsOrColumns.bind(SheetActions),
      name: "Delete selected rows/columns",
      group: "editing"
    },
    clear: {
      fn: SheetActions.clear.bind(SheetActions),
      name: "Clear",
      group: "editing"
    },
    changeCell: {
      fn: SheetActions.changeCell.bind(SheetActions),
      name: "Change cell",
      group: "editing"
    },
    moveCursorToCellLineEnd: {
      fn: SheetActions.moveCursorToCellLineEnd.bind(SheetActions),
      name: "Move cursor to line end",
      group: "editing",
      // This is hidden because this is an insert-mode binding, and that concept
      // isn't yet exposed to the user or handled by the UI.
      hiddenFromHelp: true,
    },
    copyRowOrSelection: {
      fn: SheetActions.copyRowOrSelection.bind(SheetActions),
      name: "Copy row, or selected cells",
      group: "editing"
    },
    // "Yank cell"
    copy: {
      fn: SheetActions.copy.bind(SheetActions),
      name: "Copy cells",
      group: "editing"
    },
    paste: {
      fn: SheetActions.paste.bind(SheetActions),
      name: "Paste",
      group: "editing"
    },
    exitMode: {
      fn: SheetActions.exitMode.bind(SheetActions),
      name: "Exit the current mode",
      group: "editing"
    },

    // Merging cells
    mergeAllCells: {
      fn: SheetActions.mergeAllCells.bind(SheetActions),
      name: "Merge all cells",
      group: "editing"
    },
    mergeCellsHorizontally: {
      fn: SheetActions.mergeCellsHorizontally.bind(SheetActions),
      name: "Merge cells horizontally",
      group: "editing"
    },
    mergeCellsVertically: {
      fn: SheetActions.mergeCellsVertically.bind(SheetActions),
      name: "Merge cells vertically",
      group: "editing"
    },
    unmergeCells: {
      fn: SheetActions.unmergeCells.bind(SheetActions),
      name: "Unmerge cells",
      group: "editing"
    },

    // Selection
    enterVisualMode: {
      fn: SheetActions.enterVisualMode.bind(SheetActions),
      name: "Begin selecting cells",
      group: "selection"
    },
    enterVisualRowMode: {
      fn: SheetActions.enterVisualRowMode.bind(SheetActions),
      name: "Begin selecting rows",
      group: "selection"
    },
    enterVisualColumnMode: {
      fn: SheetActions.enterVisualColumnMode.bind(SheetActions),
      name: "Begin selecting columns",
      group: "selection"
    },

    // Scrolling
    scrollHalfPageDown: {
      fn: SheetActions.scrollHalfPageDown.bind(SheetActions),
      name: "Scroll half page down",
      group: "movement"
    },
    scrollHalfPageUp: {
      fn: SheetActions.scrollHalfPageUp.bind(SheetActions),
      name: "Scroll half page up",
      group: "movement"
    },
    scrollToTop: {
      fn: SheetActions.scrollToTop.bind(SheetActions),
      name: "Scroll to top",
      group: "movement"
    },
    scrollToBottom: {
      fn: SheetActions.scrollToBottom.bind(SheetActions),
      name: "Scroll to bottom",
      group: "movement"
    },

    // Tabs
    moveTabRight: {
      fn: SheetActions.moveTabRight.bind(SheetActions),
      name: "Move tab right",
      group: "tabs"
    },
    moveTabLeft: {
      fn: SheetActions.moveTabLeft.bind(SheetActions),
      name: "Move tab left",
      group: "tabs"
    },
    nextTab: {
      fn: SheetActions.nextTab.bind(SheetActions),
      name: "Next tab",
      group: "tabs"
    },
    prevTab: {
      fn: SheetActions.prevTab.bind(SheetActions),
      name: "Previous tab",
      group: "tabs"
    },

    // Formatting
    alignLeft: {
      fn: SheetActions.alignLeft.bind(SheetActions),
      name: "Align left",
      group: "formatting"
    },
    alignCenter: {
      fn: SheetActions.alignCenter.bind(SheetActions),
      name: "Align center",
      group: "formatting"
    },
    alignRight: {
      fn: SheetActions.alignRight.bind(SheetActions),
      name: "Align right",
      group: "formatting"
    },
    wrap: {
      fn: SheetActions.wrap.bind(SheetActions),
      name: "Wrap cell",
      group: "formatting"
    },
    overflow: {
      fn: SheetActions.overflow.bind(SheetActions),
      name: "Overflow cell",
      group: "formatting"
    },
    clip: {
      fn: SheetActions.clip.bind(SheetActions),
      name: "Clip cell",
      group: "formatting"
    },
    colorCellWhite: {
      fn: SheetActions.colorCellWhite.bind(SheetActions),
      name: "Color background white",
      group: "formatting",
      hiddenFromHelp: true
    },
    colorCellLightYellow3: {
      fn: SheetActions.colorCellLightYellow3.bind(SheetActions),
      name: "Color background light yellow 3",
      group: "formatting",
      hiddenFromHelp: true
    },
    colorCellLightCornflowerBlue3: {
      fn: SheetActions.colorCellLightCornflowerBlue3.bind(SheetActions),
      name: "Color cell light corn flower blue 3",
      group: "formatting",
      hiddenFromHelp: true
    },
    colorCellLightPurple: {
      fn: SheetActions.colorCellLightPurple.bind(SheetActions),
      name: "Color cell light purple",
      group: "formatting",
      hiddenFromHelp: true
    },
    colorCellLightRed3: {
      fn: SheetActions.colorCellLightRed3.bind(SheetActions),
      name: "Color cell light red 3",
      group: "formatting",
      hiddenFromHelp: true
    },
    colorCellLightGray2: {
      fn: SheetActions.colorCellLightGray2.bind(SheetActions),
      name: "Color cell light gray 2",
      group: "formatting",
      hiddenFromHelp: true
    },
    fontSizeNormal: {
      fn: SheetActions.setFontSize10.bind(SheetActions),
      name: "Set font size to normal",
      group: "formatting"
    },
    fontSizeLarge: {
      fn: SheetActions.setFontSize12.bind(SheetActions),
      name: "Set font size to large",
      group: "formatting"
    },
    fontSizeSmall: {
      fn: SheetActions.setFontSize8.bind(SheetActions),
      name: "Set font size to small",
      group: "formatting"
    },
    freezeRow: {
      fn: SheetActions.freezeRow.bind(SheetActions),
      name: "Freeze row",
      group: "formatting"
    },
    freezeColumn: {
      fn: SheetActions.freezeColumn.bind(SheetActions),
      name: "Freeze column",
      group: "formatting"
    },

    // Misc
    showHelp: {
      fn: SheetActions.showHelpDialog,
      name: "Show help",
      group: "other"
    },
    toggleFullScreen: {
      fn: SheetActions.toggleFullScreen.bind(SheetActions),
      name: "Toggle full screen",
      group: "other"
    },
    openCellAsUrl: {
      fn: SheetActions.openCellAsUrl.bind(SheetActions),
      name: "Open URL in cell in a new tab",
      group: "other"
    },
    reloadPage: {
      fn: SheetActions.reloadPage.bind(SheetActions),
      name: "Reload page",
      group: "other"
    },

    // /////////////////////////////////////////
    // Rishi additions

    // Movement additions
    moveEndDown: {
      fn: SheetActions.moveEndDown.bind(SheetActions),
      name: "Move down to bottom",
      group: "movement"
    },
    moveEndUp: {
      fn: SheetActions.moveEndUp.bind(SheetActions), name: "Reload page",
      name: "Move up to top",
      group: "movement"
    },
    moveEndRight: {
      fn: SheetActions.moveEndRight.bind(SheetActions), name: "Reload page",
      name: "Move right to end",
      group: "movement"
    },
    moveEndLeft: {
      fn: SheetActions.moveEndLeft.bind(SheetActions),
      name: "Move left to start",
      group: "movement"
    },

    // Paste additions
    pasteFormatOnly: {
      fn: SheetActions.pasteFormatOnly.bind(SheetActions),
      name: "Paste",
      group: "editing"
    },
    pasteValuesOnly: {
      fn: SheetActions.pasteValuesOnly.bind(SheetActions),
      name: "Paste",
      group: "editing"
    },
    pasteFormulaOnly: {
      fn: SheetActions.pasteFormulaOnly.bind(SheetActions),
      name: "Paste",
      group: "editing"
    },

    // Selection additions
    moveEndDownAndSelect: {
      fn: SheetActions.moveEndDownAndSelect.bind(SheetActions),
      name: "Select down to bottom",
      group: "selection"
    },
    moveEndUpAndSelect: {
      fn: SheetActions.moveEndUpAndSelect.bind(SheetActions),
      name: "Select up to top",
      group: "selection"
    },
    moveEndLeftAndSelect: {
      fn: SheetActions.moveEndLeftAndSelect.bind(SheetActions),
      name: "Select left to start",
      group: "selection"
    },
    moveEndRightAndSelect: {
      fn: SheetActions.moveEndRightAndSelect.bind(SheetActions),
      name: "Select right to end",
      group: "selection"
    },

    // Copy down additions
    copyEndDownAndCopy: {
      fn: SheetActions.copyEndDownAndCopy.bind(SheetActions),
      name: "Copy cell down to bottom",
      group: "fill"
    },

    // Filtering
    //NOTE: Only works if Rishi OR Albert menu is installed
    filterToggle: {
      fn: SheetActions.filterToggle.bind(SheetActions),
      name: "Toogl filter",
      group: "filter"
    },
    fitlerOnActiveCell: {
      fn: SheetActions.fitlerOnActiveCell.bind(SheetActions),
      name: "Filter on active cell",
      group: "filter"
    },
    removeAllFilters: {
      fn: SheetActions.removeAllFilters.bind(SheetActions),
      name: "Remove all filters",
      group: "filter"
    },

    // Cell background color
    colorCellLightYellow: {
      fn: SheetActions.colorCellYellow.bind(SheetActions),
      name: "yellow",
      group: "cell color"
    },
    colorCellLightBlue3: {
      fn: SheetActions.colorCellLightBlue3.bind(SheetActions),
      name: "blue 3",
      group: "cell color"
    },
    colorCellDarkGray1: {
      fn: SheetActions.colorCellDarkGray1.bind(SheetActions),
      name: "dark gray 1",
      group: "cell color"
    },

    // Font color 
    colorCellFontColorRed: {
      fn: SheetActions.colorCellFontColorRed.bind(SheetActions),
      name: "Font red",
      group: "font color"
    },
    colorCellFontColorDarkRed: {
      fn: SheetActions.colorCellFontColorDarkRed.bind(SheetActions),
      name: "Font dark red",
      group: "font color"
    },
    colorCellFontColorBlue: {
      fn: SheetActions.colorCellFontColorBlue.bind(SheetActions),
      name: "Font blue",
      group: "font color"
    },
    colorCellFontColorBlack: {
      fn: SheetActions.colorCellFontColorBlack.bind(SheetActions),
      name: "Font black",
      group: "fontr color"
    },

    // Formatting, numeric
    numberFormatNumber2: {
      fn: SheetActions.numberFormatNumber2.bind(SheetActions),
      name: "Number format",
      group: "number format"
    },
    numberFormatDollar2: {
      fn: SheetActions.numberFormatDollar2.bind(SheetActions),
      name: "Dollar format",
      group: "number format"
    },
    numberFormatPercent2: {
      fn: SheetActions.numberFormatPercent2.bind(SheetActions),
      name: "Percent format",
      group: "number format"
    },
    decimalIncrease: {
      fn: SheetActions.decimalIncrease.bind(SheetActions),
      name: "Decimal increase",
      group: "number format"
    },
    decimalDecrease: {
      fn: SheetActions.decimalDecrease.bind(SheetActions),
      name: "Decimal decrease",
      group: "number format"
    },

    // border
    borderTop: {
      fn: SheetActions.borderTop.bind(SheetActions),
      name: "Border top",
      group: "border"
    },
    borderBottom: {
      fn: SheetActions.borderBottom.bind(SheetActions),
      name: "Border bottom",
      group: "border"
    },
    borderRight: {
      fn: SheetActions.borderRight.bind(SheetActions),
      name: "Border right",
      group: "border"
    },
    borderLeft: {
      fn: SheetActions.borderLeft.bind(SheetActions),
      name: "Border left",
      group: "border"
    },
    borderClear: {
      fn: SheetActions.borderClear.bind(SheetActions),
      name: "Border clear",
      group: "border"
    },

    // Zoom
    zoom100: {
      fn: SheetActions.setZoom100.bind(SheetActions),
      name: "Zoom 100%",
      group: "zoom"
    },
    zoom90: {
      fn: SheetActions.setZoom90.bind(SheetActions),
      name: "Zoom 90%",
      group: "zoom"
    },
    zoom80: {
      fn: SheetActions.setZoom75.bind(SheetActions),
      name: "Zoom 80%",
      group: "zoom"
    },

    // UI elements
    openCommandPalette: {
      fn: SheetActions.openCommandPalette.bind(SheetActions),
      name: "Open command palette",
      group: "ui"
    },
    openSearch: {
      fn: SheetActions.openSearch.bind(SheetActions),
      name: "Open search",
      group: "ui"
    },
    openTabsList: {
      fn: SheetActions.openTabsList.bind(SheetActions),
      name: "Open tabs list",
      group: "ui"
    },

    // /////////////////////////////////////////
  },

  defaultMappings: {
    "normal": {
      // Cursor movement
      "moveUp": "k",
      "moveDown": "j",
      "moveLeft": "h",
      "moveRight": "l",

      "moveEndRight": "e",

      // Row & column movement
      "moveRowsDown": "<C-J>",
      "moveRowsUp": "<C-K>",
      "moveColumnsLeft": "<C-H>",
      "moveColumnsRight": "<C-L>",

      // Editing
      "editCell": "i",
      "editCellAppend": "a",
      "undo": "u",
      "redo": "<C-r>",
      "replaceChar": "r",
      "openRowBelow": "o",
      "openRowAbove": "O",
      "insertRowBelow": "s",
      "insertRowAbove": "S",
      "deleteRowsOrColumns": "d•d",
      "clear": "x",
      "changeCell": "c•c",
      "copyRowOrSelection": "y•y",

      // Merging cells
      "mergeAllCells": ";•m•a",
      "unmergeCells": ";•m•u",
      "mergeCellsHorizontally": ";•m•h",
      "mergeCellsVertically": ";•m•v",

      // "Yank cell"
      "copy": "y•c",
      "paste": "p",

      // Selection
      "enterVisualMode": "v",
      "enterVisualRowMode": "V",
      "enterVisualColumnMode": "<A-v>",

      // Scrolling
      "scrollHalfPageDown": "<C-d>",
      "scrollHalfPageUp": "<C-u>",
      "scrollToTop": "g•g",
      "scrollToBottom": "G",

      // Tabs
      "moveTabRight": ">•>",
      "moveTabLeft": "<•<",
      "nextTab": "g•t",
      "prevTab": "g•T",
      "prevTab": "J",
      "nextTab": "K",

      // Formatting
      "wrap": ";•w•w",
      "overflow": ";•w•o",
      "clip": ";•w•c",
      "alignLeft": ";•a•l",
      "alignCenter": ";•a•c",
      "alignRight": ";•a•r",
      "colorCellWhite": ";•c•w",
      "colorCellLightYellow3": ";•c•y",
      "colorCellLightCornflowerBlue3": ";•c•b",
      "colorCellLightPurple": ";•c•p",
      "colorCellLightRed3": ";•c•r",
      "colorCellLightGray2": ";•c•g",
      "fontSizeNormal": ";•f•n",
      "fontSizeLarge": ";•f•l",
      "fontSizeSmall": ";•f•s",
      "freezeRow": ";•f•r",
      "freezeColumn": ";•f•c",

      // Misc
      "showHelp": "?",
      "toggleFullScreen": ";•w•f", // Mnemonic for "window full screen"
      "openCellAsUrl": ";•o",
      // For some reason Cmd-r, which normally reloads the page, is disabled by Sheets.
      "reloadPage": "<M-r>",
      // Don't pass through ESC to the page in normal mode. If you hit ESC in normal mode, nothing should
      // happen. If we pass this through to Sheets, Sheets will exit full screen mode if it's activated.
      "exitMode": "esc"
    },

    // NOTE(philc): Currently we only let the user bind mappings for normal mode commands. So, if the user
    // binds a mapping for a normal mode command which is also available in insert mode (like "exitMode"),
    // then the mapping from normal mode will be used, even in insert mode.
    "insert": {
      // In normal Sheets, esc takes you out of the cell and loses your edits. That's a poor experience for
      // people used to Vim. Now ESC will save your cell edits and put you back in normal mode.
      "exitMode": "esc",
      // In form fields on Mac, C-e takes you to the end of the field. For some reason C-e doesn't work in
      // Sheets. Here, we fix that.
      "moveCursorToCellLineEnd": "<C-e>",
      "reloadPage": "<M-r>"
    }
  }
};

window.Commands = Commands;
