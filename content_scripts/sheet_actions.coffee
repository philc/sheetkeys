window.SheetActions =
  buttons:
    deleteRow: "Delete row"
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

  deleteRows: -> @click(buttons.deleteRow)

  insertRowsBelow: (n) ->
    for i in [0..n]
      @click(@buttons.rowBelow)

  selectRow: ->
    # TODO(philc): Remove this circular dependency
    UI.typeKey(KeyboardUtils.keyCodes.space, shift: true)

  selectColumn: ->
    UI.typeKey(KeyboardUtils.keyCodes.space, control: true)

  #
  # Movement
  #
  moveUp: -> UI.typeKey(KeyboardUtils.keyCodes.upArrow)
  moveDown: -> UI.typeKey(KeyboardUtils.keyCodes.downArrow)
  moveLeft: -> UI.typeKey(KeyboardUtils.keyCodes.leftArrow)
  moveRight: -> UI.typeKey(KeyboardUtils.keyCodes.rightArrow)

  #
  # Row movement
  #
  moveRowsUp: () ->
    @selectRow()
    @click(@buttons.moveRowUp)

  moveRowsDown: () ->
    @selectRow()
    @click(@buttons.moveRowDown)

  moveColumnsLeft: () ->
    @selectColumn()
    @click(@buttons.moveColumnLeft)

  moveColumnsRight: () ->
    @selectColumn()
    @click(@buttons.moveColumnRight)

  #
  # Editing
  #
  undo: () -> @click(@buttons.undo)
  redo: () -> @click(@buttons.redo)

  openRowBelow: () ->
    @click(@buttons.rowBelow)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  openRowAbove: () ->
    @click(@buttons.rowAbove)
    UI.typeKey(KeyboardUtils.keyCodes.enter)
