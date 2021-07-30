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
    fontSizeNormal: { fn: SheetActions.setFontSize10.bind(SheetActions) },
    fontSizeSmall: { fn: SheetActions.setFontSize8.bind(SheetActions) },
    freezeRow: { fn: SheetActions.freezeRow.bind(SheetActions) },
    freezeColumn: { fn: SheetActions.freezeColumn.bind(SheetActions) },

    // Color Cells
    // You can find the names of these color swatches by hoverig over the swatches and seeing the tooltip.

    // Black to White
    colorCellBlack: { fn: () => SheetActions.colorCell.bind(SheetActions)('black') },
    colorCellDarkGrey4: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark gray 4') },
    colorCellDarkGray3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark gray 3') },
    colorCellDarkGray2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark gray 2') },
    colorCellDarkGray1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark gray 1') },
    colorCellGray: { fn: () => SheetActions.colorCell.bind(SheetActions)('gray') },
    colorCellLightGray1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light gray 1') },
    colorCellLightGray2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light gray 2') },
    colorCellLightGray3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light gray 3') },
    colorCellWhite: { fn: () => SheetActions.colorCell.bind(SheetActions)('white') },

    // Red Berry
    colorCellRedBerry: { fn: () => SheetActions.colorCell.bind(SheetActions)('red berry') },
    colorCellDarkRedBerry3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark red berry 3') },
    colorCellDarkRedBerry2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark red berry 2') },
    colorCellDarkRedBerry1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark red berry 1') },
    colorCellLightRedBerry1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light red berry 1') },
    colorCellLightRedBerry2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light red berry 2') },
    colorCellLightRedBerry3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light red berry 3') },

    // Red
    colorCellRed: { fn: () => SheetActions.colorCell.bind(SheetActions)('red') },
    colorCellDarkRed3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark red 3') },
    colorCellDarkRed2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark red 2') },
    colorCellDarkRed1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark red 1') },
    colorCellLightRed1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light red 1') },
    colorCellLightRed2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light red 2') },
    colorCellLightRed3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light red 3') },

    // Orange
    colorCellOrange: { fn: () => SheetActions.colorCell.bind(SheetActions)('orange') },
    colorCellDarkOrange3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark orange 3') },
    colorCellDarkOrange2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark orange 2') },
    colorCellDarkOrange1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark orange 1') },
    colorCellLightOrange1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light orange 1') },
    colorCellLightOrange2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light orange 2') },
    colorCellLightOrange3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light orange 3') },

    // Yellow
    colorCellYellow: { fn: () => SheetActions.colorCell.bind(SheetActions)('yellow') },
    colorCellDarkYellow3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark yellow 3') },
    colorCellDarkYellow2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark yellow 2') },
    colorCellDarkYellow1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark yellow 1') },
    colorCellLightYellow1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light yellow 1') },
    colorCellLightYellow2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light yellow 2') },
    colorCellLightYellow3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light yellow 3') },

    // Green
    colorCellGreen: { fn: () => SheetActions.colorCell.bind(SheetActions)('green') },
    colorCellDarkGreen3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark green 3') },
    colorCellDarkGreen2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark green 2') },
    colorCellDarkGreen1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark green 1') },
    colorCellLightGreen1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light green 1') },
    colorCellLightGreen2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light green 2') },
    colorCellLightGreen3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light green 3') },

    // Cyan
    colorCellCyan: { fn: () => SheetActions.colorCell.bind(SheetActions)('cyan') },
    colorCellDarkCyan3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark cyan 3') },
    colorCellDarkCyan2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark cyan 2') },
    colorCellDarkCyan1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark cyan 1') },
    colorCellLightCyan1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light cyan 1') },
    colorCellLightCyan2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light cyan 2') },
    colorCellLightCyan3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light cyan 3') },

    // Corn Flower Blue
    colorCellCornFlowerBlue: { fn: () => SheetActions.colorCell.bind(SheetActions)('cornflower blue') },
    colorCellDarkCornFlowerBlue3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark cornflower blue 3') },
    colorCellDarkCornFlowerBlue2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark cornflower blue 2') },
    colorCellDarkCornFlowerBlue1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark cornflower blue 1') },
    colorCellLightCornFlowerBlue1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light cornflower blue 1') },
    colorCellLightCornFlowerBlue2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light cornflower blue 2') },
    colorCellLightCornFlowerBlue3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light cornflower blue 3') },

    // Blue
    colorCellBlue: { fn: () => SheetActions.colorCell.bind(SheetActions)('blue') },
    colorCellDarkBlue3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark blue 3') },
    colorCellDarkBlue2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark blue 2') },
    colorCellDarkBlue1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark blue 1') },
    colorCellLightBlue1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light blue 1') },
    colorCellLightBlue2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light blue 2') },
    colorCellLightBlue3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light blue 3') },

    // Purple
    colorCellPurple: { fn: () => SheetActions.colorCell.bind(SheetActions)('purple') },
    colorCellDarkPurple3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark purple 3') },
    colorCellDarkPurple2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark purple 2') },
    colorCellDarkPurple1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark purple 1') },
    colorCellLightPurple1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light purple 1') },
    colorCellLightPurple2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light purple 2') },
    colorCellLightPurple3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light purple 3') },

    // Magenta
    colorCellMagenta: { fn: () => SheetActions.colorCell.bind(SheetActions)('magenta') },
    colorCellDarkMagenta3: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark magenta 3') },
    colorCellDarkMagenta2: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark magenta 2') },
    colorCellDarkMagenta1: { fn: () => SheetActions.colorCell.bind(SheetActions)('dark magenta 1') },
    colorCellLightMagenta1: { fn: () => SheetActions.colorCell.bind(SheetActions)('light magenta 1') },
    colorCellLightMagenta2: { fn: () => SheetActions.colorCell.bind(SheetActions)('light magenta 2') },
    colorCellLightMagenta3: { fn: () => SheetActions.colorCell.bind(SheetActions)('light magenta 3') },


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
      ";,f,n": "fontSizeNormal",
      ";,f,s": "fontSizeSmall",
      ";,f,r": "freezeRow",
      ";,f,c": "freezeColumn",

      // Cell Colors
      // Black to White
      ";,c,`,0,0": "colorCellBlack",
      ";,c,0,1,4": "colorCellDarkGrey4",
      ";,c,0,1,3": "colorCellDarkGray3",
      ";,c,0,1,2": "colorCellDarkGray2",
      ";,c,0,1,1": "colorCellDarkGray1",
      ";,c,0,0,0": "colorCellGray",
      ";,c,0,0,1": "colorCellLightGray1",
      ";,c,0,0,2": "colorCellLightGray2",
      ";,c,0,0,3": "colorCellLightGray3",
      ";,c,1,0,0": "colorCellWhite",

      // Red Berry
      ";,c,2,0,0": "colorCellRedBerry",
      ";,c,2,1,3": "colorCellDarkRedBerry3",
      ";,c,2,1,2": "colorCellDarkRedBerry2",
      ";,c,2,1,1": "colorCellDarkRedBerry1",
      ";,c,2,0,1": "colorCellLightRedBerry1",
      ";,c,2,0,2": "colorCellLightRedBerry2",
      ";,c,2,0,3": "colorCellLightRedBerry3",

      // Red
      ";,c,3,0,0": "colorCellRed",
      ";,c,3,1,3": "colorCellDarkRed3",
      ";,c,3,1,2": "colorCellDarkRed2",
      ";,c,3,1,1": "colorCellDarkRed1",
      ";,c,3,0,1": "colorCellLightRed1",
      ";,c,3,0,2": "colorCellLightRed2",
      ";,c,3,0,3": "colorCellLightRed3",

      // Orange
      ";,c,4,0,0": "colorCellOrange",
      ";,c,4,1,3": "colorCellDarkOrange3",
      ";,c,4,1,2": "colorCellDarkOrange2",
      ";,c,4,1,1": "colorCellDarkOrange1",
      ";,c,4,0,1": "colorCellLightOrange1",
      ";,c,4,0,2": "colorCellLightOrange2",
      ";,c,4,0,3": "colorCellLightOrange3",

      // Yellow
      ";,c,5,0,0": "colorCellYellow",
      ";,c,5,1,3": "colorCellDarkYellow3",
      ";,c,5,1,2": "colorCellDarkYellow2",
      ";,c,5,1,1": "colorCellDarkYellow1",
      ";,c,5,0,1": "colorCellLightYellow1",
      ";,c,5,0,2": "colorCellLightYellow2",
      ";,c,5,0,3": "colorCellLightYellow3",

      // Green
      ";,c,6,0,0": "colorCellGreen",
      ";,c,6,1,3": "colorCellDarkGreen3",
      ";,c,6,1,2": "colorCellDarkGreen2",
      ";,c,6,1,1": "colorCellDarkGreen1",
      ";,c,6,0,1": "colorCellLightGreen1",
      ";,c,6,0,2": "colorCellLightGreen2",
      ";,c,6,0,3": "colorCellLightGreen3",

      // Cyan
      ";,c,7,0,0": "colorCellCyan",
      ";,c,7,1,3": "colorCellDarkCyan3",
      ";,c,7,1,2": "colorCellDarkCyan2",
      ";,c,7,1,1": "colorCellDarkCyan1",
      ";,c,7,0,1": "colorCellLightCyan1",
      ";,c,7,0,2": "colorCellLightCyan2",
      ";,c,7,0,3": "colorCellLightCyan3",

      // Corn Flower Blue
      ";,c,8,0,0": "colorCellCornFlowerBlue",
      ";,c,8,1,3": "colorCellDarkCornFlowerBlue3",
      ";,c,8,1,2": "colorCellDarkCornFlowerBlue2",
      ";,c,8,1,1": "colorCellDarkCornFlowerBlue1",
      ";,c,8,0,1": "colorCellLightCornFlowerBlue1",
      ";,c,8,0,2": "colorCellLightCornFlowerBlue2",
      ";,c,8,0,3": "colorCellLightCornFlowerBlue3",

      // Blue
      ";,c,9,0,0": "colorCellBlue",
      ";,c,9,1,3": "colorCellDarkBlue3",
      ";,c,9,1,2": "colorCellDarkBlue2",
      ";,c,9,1,1": "colorCellDarkBlue1",
      ";,c,9,0,1": "colorCellLightBlue1",
      ";,c,9,0,2": "colorCellLightBlue2",
      ";,c,9,0,3": "colorCellLightBlue3",

      // Purple
      ";,c,-,0,0": "colorCellPurple",
      ";,c,-,1,3": "colorCellDarkPurple3",
      ";,c,-,1,2": "colorCellDarkPurple2",
      ";,c,-,1,1": "colorCellDarkPurple1",
      ";,c,-,0,1": "colorCellLightPurple1",
      ";,c,-,0,2": "colorCellLightPurple2",
      ";,c,-,0,3": "colorCellLightPurple3",

      // Magenta
      ";,c,=,0,0": "colorCellMagenta",
      ";,c,=,1,3": "colorCellDarkMagenta3",
      ";,c,=,1,2": "colorCellDarkMagenta2",
      ";,c,=,1,1": "colorCellDarkMagenta1",
      ";,c,=,0,1": "colorCellLightMagenta1",
      ";,c,=,0,2": "colorCellLightMagenta2",
      ";,c,=,0,3": "colorCellLightMagenta3",


      // Misc
      ";,w,m": "toggleFullScreen", // Mnemonic for "window maximize"
      ";,w,f": "toggleFullScreen", // Mnemonic for "window full screen"
      ";,o": "openCellAsUrl",
      // For some reason Cmd-r, which normally reloads the page, is disabled by sheets.
      "<M-r>": "reloadPage",
      // Don't pass through ESC to the page in normal mode. If you hit ESC in normal mode, nothing should
      // happen. If you mistakenly type it in Sheets, you will exit full screen mode.
      "esc": "exitMode"
    },

    "insert": {
      // In normal Sheets, esc takes you out of the cell and loses your edits. That's a poor experience for
      // people used to Vim. Now ESC will save your cell edits and put you back in normal mode.
      "esc": "commitCellChanges",
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
