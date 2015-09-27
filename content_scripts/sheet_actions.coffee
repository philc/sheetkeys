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

  clickMenu: (buttonCaption) -> KeyboardUtils.simulateClick(@getButton(buttonCaption))

  deleteRows: -> @clickMenu(@buttons.deleteRow)

  insertRowsBelow: (n) ->
    for i in [0..n]
      @clickMenu(@buttons.rowBelow)

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
    @clickMenu(@buttons.moveRowUp)

  moveRowsDown: ->
    @selectRow()
    @clickMenu(@buttons.moveRowDown)

  moveColumnsLeft: ->
    @selectColumn()
    @clickMenu(@buttons.moveColumnLeft)

  moveColumnsRight: ->
    @selectColumn()
    @clickMenu(@buttons.moveColumnRight)

  #
  # Editing
  #
  undo: -> @clickMenu(@buttons.undo)
  redo: -> @clickMenu(@buttons.redo)

  clear: -> @clickMenu(@buttons.deleteValues)

  openRowBelow: ->
    @clickMenu(@buttons.rowBelow)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  openRowAbove: ->
    @clickMenu(@buttons.rowAbove)
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

  #
  # Scrolling
  #

  # In px. Measured on a mac with Chrome's zoom level at 100%.
  rowHeight: -> 17

  # The approximate number of visible rows. It's probably possible to compute this precisely.
  visibleRowCount: ->
     Math.ceil(document.querySelector(".grid-scrollable-wrapper").offsetHeight / @rowHeight())

  # NOTE(philc): It would be nice to improve these scrolling commands. They're somewhat slow and imprecise.
  scrollHalfPageDown: ->
    for _ in [0..(@visibleRowCount() / 2)]
      UI.typeKey(KeyboardUtils.keyCodes.downArrow)

  scrollHalfPageUp: ->
    for _ in [0..(@visibleRowCount() / 2)]
      UI.typeKey(KeyboardUtils.keyCodes.upArrow)

  scrollToTop: ->
    # TODO(philc): This may not work on Linux or Windows since it uses the meta key. Replace with CTRL on
    # those platforms?
    UI.typeKey(KeyboardUtils.keyCodes.home, meta: true)

  scrollToBottom: ->
    UI.typeKey(KeyboardUtils.keyCodes.end, meta: true)

  #
  # Tabs
  #
  getTabEls: -> document.querySelectorAll(".docs-sheet-tab")
  getActiveTabIndex: ->
    for tab, i in @getTabEls()
      return i if tab.classList.contains("docs-sheet-active-tab")
    null

  moveTabRight: -> @clickTabButton("Move right")
  moveTabLeft: -> @clickTabButton("Move left")

  prevTab: ->
    tabs = @getTabEls()
    prev = @getActiveTabIndex() - 1
    return unless prev >= 0
    KeyboardUtils.simulateClick(tabs[prev])

  nextTab: ->
    tabs = @getTabEls()
    next = @getActiveTabIndex() + 1
    return unless next < tabs.length
    KeyboardUtils.simulateClick(tabs[next])

  clickTabButton: (buttonCaption) ->
    menu = document.querySelector(".docs-sheet-tab-menu")
    # This tab menu element gets created the first time the user clicks on it, so it may not yet be available
    # in the DOM.
    @activateTabMenu() unless menu
    menuItems = document.querySelectorAll(".docs-sheet-tab-menu .goog-menuitem")
    result = null
    for item in menuItems
      if item.innerText.indexOf(buttonCaption) == 0
        result = item
        break
    unless result
      console.log "Couldn't find a tab menu item with the caption #{buttonCaption}"
      return
    KeyboardUtils.simulateClick(result)

  # Shows and then hides the tab menu for the currently selected tab.
  # This has the side effect of forcing Sheets to create the menu DOM element if it hasn't yet been created.
  activateTabMenu: ->
    menuButton = document.querySelector(".docs-sheet-active-tab .docs-icon-arrow-dropdown")
    # Show and then hide the tab menu.
    KeyboardUtils.simulateClick(menuButton)
    KeyboardUtils.simulateClick(menuButton)
