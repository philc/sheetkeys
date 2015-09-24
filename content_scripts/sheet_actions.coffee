window.SheetActions =
  buttonNames:
    deleteRow: "Delete row"

  buttons: {}

  getButton: (buttonName) ->
    button = @buttons[buttonName]
    return button if button
    caption = @buttonNames[buttonName]
    button = @findMenuItem(caption)
    unless button
      console.log("Warning: could not find #{buttonName} button with caption #{caption}")
      return null
    return @buttons[buttonName] = button

  deleteRows: ->
    console.log "Deleting rows"
    KeyboardUtils.simulateClick(@getButton("deleteRow"))

  insertRowsBelow: (n) ->
    button = findMenuItem("Row below");
    for i in [0..n]
      KeyboardUtils.simulateClick(button)

  findMenuItem: (caption) ->
    menuItems = document.querySelectorAll(".goog-menuitem")
    for menuItem in menuItems
      label = menuItem.innerText;
      console.log(label)
      if (label && label.indexOf(caption) == 0)
        return menuItem
    null
