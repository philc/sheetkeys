window.SheetActions =
  buttons:
    deleteRow: "Delete row"
    deleteValues: "Delete values"
    rowAbove: "Row above"
    rowBelow: "Row below"
    moveRowUp: "Move row up"
    moveRowDown: "Move row down"
    moveColumnLeft: "Move column left"
    moveColumnRight: "Move column right"
    undo: "Undo"
    redo: "Redo"

  # A mapping of button-caption to DOM element.
  buttonElements: {}

  getButton: (caption) ->
    button = @buttonElements[caption]
    return button if button
    button = @findMenuItem(caption)
    unless button
      console.log("Warning: could not find button with caption #{caption}")
      return null
    return @buttonElements[caption] = button

  findMenuItem: (caption) ->
    menuItems = document.querySelectorAll(".goog-menuitem")
    for menuItem in menuItems
      label = menuItem.innerText;
      if (label && label.indexOf(caption) == 0)
        return menuItem
    null

  click: (buttonCaption) -> KeyboardUtils.simulateClick(@getButton(buttonCaption))

  deleteRows: -> @click(@buttons.deleteRow)

  insertRowsBelow: (n) ->
    for i in [0..n]
      @click(@buttons.rowBelow)

  selectRow: ->
    # TODO(philc): Remove this circular dependency
    UI.typeKey(KeyboardUtils.keyCodes.space, shift: true)

  selectColumn: ->
    UI.typeKey(KeyboardUtils.keyCodes.space, control: true)

  # Assuming a row is selected, just select the first cell in that row.
  unselectRow: -> UI.typeKey(KeyboardUtils.keyCodes.leftArrow)

  #
  # Movement
  #
  moveUp: -> UI.typeKey(KeyboardUtils.keyCodes.upArrow)
  moveDown: -> UI.typeKey(KeyboardUtils.keyCodes.downArrow)
  moveLeft: -> UI.typeKey(KeyboardUtils.keyCodes.leftArrow)
  moveRight: -> UI.typeKey(KeyboardUtils.keyCodes.rightArrow)

  moveDownAndSelect: -> UI.typeKey(KeyboardUtils.keyCodes.downArrow, shift: true)
  moveUpAndSelect: -> UI.typeKey(KeyboardUtils.keyCodes.upArrow, shift: true)
  moveLeftAndSelect: -> UI.typeKey(KeyboardUtils.keyCodes.leftArrow, shift: true)
  moveRightAndSelect: -> UI.typeKey(KeyboardUtils.keyCodes.rightArrow, shift: true)

  #
  # Row movement
  #
  moveRowsUp: ->
    @selectRow()
    @click(@buttons.moveRowUp)

  moveRowsDown: ->
    @selectRow()
    @click(@buttons.moveRowDown)

  moveColumnsLeft: ->
    @selectColumn()
    @click(@buttons.moveColumnLeft)

  moveColumnsRight: ->
    @selectColumn()
    @click(@buttons.moveColumnRight)

  #
  # Editing
  #
  undo: -> @click(@buttons.undo)
  redo: -> @click(@buttons.redo)

  clear: -> @click(@buttons.deleteValues)

  openRowBelow: ->
    @click(@buttons.rowBelow)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  openRowAbove: ->
    @click(@buttons.rowAbove)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  changeCell: ->
    @clear()
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  # Put the cursor at the beginning of the cell.
  editCell: ->
    UI.typeKey(KeyboardUtils.keyCodes.enter)
    @moveCursorToCellStart()

  editCellAppend: ->
    # Note that appending to the cell's contents is the default behavior of the Enter key in Sheets.
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  moveCursorToCellStart: ->
    # http://stackoverflow.com/q/6249095/46237
    selection = window.getSelection()
    range = selection.getRangeAt(0)
    range.setStart(range.startContainer, 0)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

  commitCellChanges: ->
    UI.typeKey(KeyboardUtils.keyCodes.enter)
    # Enter in Sheets moves your cursor to the cell below the one you're currently editing. Avoid that.
    UI.typeKey(KeyboardUtils.keyCodes.upArrow)
