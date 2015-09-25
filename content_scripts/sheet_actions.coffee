window.SheetActions =
  buttons:
    deleteRow: "Delete row"
    rowBelow: "Row below"
    moveRowUp: "Move row up"
    moveRowDown: "Move row down"

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

  moveRowsUp: () ->
    @selectRow()
    @click(@buttons.moveRowUp)

  moveRowsDown: () ->
    @selectRow()
    @click(@buttons.moveRowDown)
