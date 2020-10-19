Commands = {
  commands: {
    // Cursor movement
    moveUp: { fn: SheetActions.moveUp.bind(SheetActions) },
    moveDown: { fn: SheetActions.moveDown.bind(SheetActions) },
    moveLeft: { fn: SheetActions.moveLeft.bind(SheetActions) },
    moveRight: { fn: SheetActions.moveRight.bind(SheetActions) },

    // Row & column movement
    moveRowsDown: { fn: SheetActions.moveRowsDown.bind(SheetActions) },
    moveRowsUp: { fn: SheetActions.moveRowsUp.bind(SheetActions) },
    moveColumnsLeft: { fn: SheetActions.moveColumnsLeft.bind(SheetActions) },
    moveColumnsRight: { fn: SheetActions.moveColumnsRight.bind(SheetActions) },

    // Editing
    editCell: { fn: SheetActions.editCell.bind(SheetActions) },
    editCellAppend: { fn: SheetActions.editCellAppend.bind(SheetActions) },
    undo: { fn: SheetActions.undo.bind(SheetActions) },
    redo: { fn: SheetActions.redo.bind(SheetActions) },
    replaceChar: { fn: UI.replaceChar.bind(UI) },
    openRowBelow: { fn: SheetActions.openRowBelow.bind(SheetActions) },
    openRowAbove: { fn: SheetActions.openRowAbove.bind(SheetActions) },
    insertRowBelow: { fn: SheetActions.insertRowBelow.bind(SheetActions) },
    insertRowAbove: { fn: SheetActions.insertRowAbove.bind(SheetActions) },
    deleteRowsOrColumns: { fn: UI.deleteRowsOrColumns.bind(UI) },
    clear: { fn: SheetActions.clear.bind(SheetActions) },
    changeCell: { fn: SheetActions.changeCell.bind(SheetActions) },
    copyRow: { fn: SheetActions.copyRow.bind(SheetActions) },
    commitCellChanges: { fn: SheetActions.commitCellChanges.bind(SheetActions) },
    moveCursorToCellLineEnd: { fn: SheetActions.moveCursorToCellLineEnd.bind(SheetActions) },
    exitMode: { fn: UI.exitMode.bind(UI) },

    // Merging cells
    mergeAllCells: { fn: SheetActions.mergeAllCells.bind(SheetActions) },
    mergeCellsHorizontally: { fn: SheetActions.mergeCellsHorizontally.bind(SheetActions) },
    mergeCellsVertically: { fn: SheetActions.mergeCellsVertically.bind(SheetActions) },
    unmergeCells: { fn: SheetActions.unmergeCells.bind(SheetActions) },

    // "Yank cell"
    copy: { fn: SheetActions.copy.bind(SheetActions) },
    paste: { fn: SheetActions.paste.bind(SheetActions) },

    // Selection
    enterVisualMode: { fn: UI.enterVisualMode.bind(UI) },
    enterVisualLineMode: { fn: UI.enterVisualLineMode.bind(UI) },
    enterVisualColumnMode: { fn: UI.enterVisualColumnMode.bind(UI) },
    moveDownAndSelect: { fn: SheetActions.moveDownAndSelect.bind(SheetActions) },
    moveUpAndSelect: { fn: SheetActions.moveUpAndSelect.bind(SheetActions) },
    moveLeftAndSelect: { fn: SheetActions.moveLeftAndSelect.bind(SheetActions) },
    moveRightAndSelect: { fn: SheetActions.moveRightAndSelect.bind(SheetActions) },

    // Scrolling
    scrollHalfPageDown:{ fn: SheetActions.scrollHalfPageDown.bind(SheetActions) },
    scrollHalfPageUp: { fn: SheetActions.scrollHalfPageUp.bind(SheetActions) },
    scrollToTop: { fn: SheetActions.scrollToTop.bind(SheetActions) },
    scrollToBottom: { fn: SheetActions.scrollToBottom.bind(SheetActions) },

    // Tabs
    moveTabRight: { fn: SheetActions.moveTabRight.bind(SheetActions) },
    moveTabLeft: { fn: SheetActions.moveTabLeft.bind(SheetActions) },
    nextTab: { fn: SheetActions.nextTab.bind(SheetActions) },
    prevTab: { fn: SheetActions.prevTab.bind(SheetActions) },

    // Formatting
    wrap: { fn: SheetActions.wrap.bind(SheetActions) },
    overflow: { fn: SheetActions.overflow.bind(SheetActions) },
    clip: { fn: SheetActions.clip.bind(SheetActions) },
    alignLeft: { fn: SheetActions.alignLeft.bind(SheetActions) },
    alignCenter: { fn: SheetActions.alignCenter.bind(SheetActions) },
    alignRight: { fn: SheetActions.alignRight.bind(SheetActions) },
    colorCellWhite: { fn : SheetActions.colorCellWhite.bind(SheetActions) },
    colorCellLightYellow3: { fn : SheetActions.colorCellLightYellow3.bind(SheetActions) },
    colorCellLightCornflowerBlue3: { fn : SheetActions.colorCellLightCornflowerBlue3.bind(SheetActions) },
    colorCellLightPurple: { fn : SheetActions.colorCellLightPurple.bind(SheetActions) },
    colorCellLightRed3: { fn : SheetActions.colorCellLightRed3.bind(SheetActions) },
    colorCellLightGray2: { fn : SheetActions.colorCellLightGray2.bind(SheetActions) },
    fontSizeNormal: { fn : SheetActions.setFontSize10.bind(SheetActions) },
    fontSizeSmall: { fn : SheetActions.setFontSize8.bind(SheetActions) },
    freezeRow: { fn: SheetActions.freezeRow.bind(SheetActions) },
    freezeColumn: { fn: SheetActions.freezeColumn.bind(SheetActions) },

    // Misc
    toggleFullScreen: { fn: SheetActions.toggleFullScreen.bind(SheetActions) },
    openCellAsUrl: { fn: SheetActions.openCellAsUrl.bind(SheetActions), },
    reloadPage: { fn: UI.reloadPage.bind(UI) },
  },

  defaultMappings: {
    "normal": {
      // Cursor movement
      "k": "moveUp",
      "j": "moveDown",
      "h": "moveLeft",
      "l": "moveRight",

      // Row & column movement
      "<C-J>": "moveRowsDown",
      "<C-K>": "moveRowsUp",
      "<C-H>": "moveColumnsLeft",
      "<C-L>": "moveColumnsRight",

      // TODO(philc): remove this because it's custom to my configuration
      "BACKSPACE": "moveColumnsLeft",

      // Editing
      "i": "editCell",
      "a": "editCellAppend",
      "u": "undo",
      "<C-r>": "redo",
      "r": "replaceChar",
      "o": "openRowBelow",
      "O": "openRowAbove",
      "s": "insertRowBelow",
      "S": "insertRowAbove",
      "d,d": "deleteRowsOrColumns",
      "x": "clear",
      "c,c": "changeCell",
      "y,y": "copyRow",

      // Merging cells
      ";,m,a": "mergeAllCells",
      ";,m,u": "unmergeCells",
      ";,m,h": "mergeCellsHorizontally",
      ";,m,v": "mergeCellsVertically",

      // "Yank cell"
      "y,c": "copy",
      "p": "paste",

      // Selection
      "v": "enterVisualMode",
      "V": "enterVisualLineMode",
      "<A-v>": "enterVisualColumnMode",

      // Scrolling
      "<C-d>": "scrollHalfPageDown",
      "<C-u>": "scrollHalfPageUp",
      "g,g": "scrollToTop",
      "G": "scrollToBottom",

      // Tabs
      ">,>": "moveTabRight",
      "<,<": "moveTabLeft",
      "g,t": "nextTab",
      "g,T": "prevTab",
      "J": "prevTab",
      "K": "nextTab",

      // Formatting
      ";,w,w": "wrap",
      ";,w,o": "overflow",
      ";,w,c": "clip",
      ";,a,l": "alignLeft",
      ";,a,c": "alignCenter",
      ";,a,r": "alignRight",
      ";,c,w": "colorCellWhite",
      ";,c,y": "colorCellLightYellow3",
      ";,c,b": "colorCellLightCornflowerBlue3",
      ";,c,p": "colorCellLightPurple",
      ";,c,r": "colorCellLightRed3",
      ";,c,g": "colorCellLightGray2",
      ";,f,n": "fontSizeNormal",
      ";,f,s": "fontSizeSmall",
      ";,f,r": "freezeRow",
      ";,f,c": "freezeColumn",

      // Misc
      ";,w,m": "toggleFullScreen", // Mnemonic for "window maximize"
      ";,w,f": "toggleFullScreen", // Mnemonic for "window full screen"
      ";,o": "openCellAsUrl",
      // For some reason Cmd-r, which normally reloads the page, is disabled by sheets.
      "<M-r>": "reloadPage",
      // Don't pass through ESC to the page in normal mode. If you hit ESC in normal mode, nothing should
      // happen. If you mistakenly type it in Sheets, you will exit full screen mode.
      "esc": "exitMode",
      "<C-[>": "exitMode"
    },

    "insert": {
      // In normal Sheets, esc takes you out of the cell and loses your edits. That's a poor experience for
      // people used to Vim. Now ESC will save your cell edits and put you back in normal mode.
      "esc": "commitCellChanges",
      "<C-[>": "commitCellChanges",
      // In form fields on Mac, C-e takes you to the end of the field. For some reason C-e doesn't work in
      // Sheets. Here, we fix that.
      "<C-e>": "moveCursorToCellLineEnd",
      "<M-r>": "reloadPage"
    }
  }
};

Commands.defaultMappings.visual = extend(clone(Commands.defaultMappings.normal), {
  "j": "moveDownAndSelect",
  "k": "moveUpAndSelect",
  "h": "moveLeftAndSelect",
  "l": "moveRightAndSelect",
  "y": "copy",
  "y,y": null // Unbind "copy row", because it's superceded by "copy"
});

Commands.defaultMappings.visualLine = clone(Commands.defaultMappings.visual);
Commands.defaultMappings.visualColumn = clone(Commands.defaultMappings.visual);
