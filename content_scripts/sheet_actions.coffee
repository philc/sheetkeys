window.SheetActions =
  menuItems:
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

  buttons:
    center: "Center"
    clip: "Clip"
    left: "Left"
    right: "Right"
    overflow: "Overflow"
    wrap: "Wrap"

  # A mapping of button-caption to DOM element.
  menuItemElements: {}

  getToolbarButton: (caption) -> document.querySelector("*[aria-label='#{caption}']")

  getMenuItem: (caption) ->
    item = @menuItemElements[caption]
    return item if item
    item = @findMenuItem(caption)
    unless item
      console.log("Warning: could not find menu item with caption #{caption}")
      return null
    return @menuItemElements[caption] = item

  findMenuItem: (caption) ->
    menuItems = document.querySelectorAll(".goog-menuitem")
    for menuItem in menuItems
      label = menuItem.innerText;
      if (label && label.indexOf(caption) == 0)
        return menuItem
    null

  clickMenu: (itemCaption) -> KeyboardUtils.simulateClick(@getMenuItem(itemCaption))

  deleteRows: ->
     @clickMenu(@menuItems.deleteRow)
     # Clear any row-level selections we might've had.
     @unselectRow()

  selectRow: ->
    # TODO(philc): Remove this circular dependency
    UI.typeKey(KeyboardUtils.keyCodes.space, shift: true)

  selectColumn: ->
    UI.typeKey(KeyboardUtils.keyCodes.space, control: true)

  # TODO(philc): This has the side effect of moving the selected column. For some reason, ESC doesn't work.
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
    @clickMenu(@menuItems.moveRowUp)

  moveRowsDown: ->
    @selectRow()
    @clickMenu(@menuItems.moveRowDown)

  moveColumnsLeft: ->
    @selectColumn()
    @clickMenu(@menuItems.moveColumnLeft)

  moveColumnsRight: ->
    @selectColumn()
    @clickMenu(@menuItems.moveColumnRight)

  #
  # Editing
  #
  undo: -> @clickMenu(@menuItems.undo)
  redo: -> @clickMenu(@menuItems.redo)

  clear: -> @clickMenu(@menuItems.deleteValues)

  openRowBelow: ->
    @clickMenu(@menuItems.rowBelow)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  openRowAbove: ->
    @clickMenu(@menuItems.rowAbove)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  changeCell: ->
    @clear()
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  # Put the cursor at the beginning of the cell.
  editCell: ->
    UI.typeKey(KeyboardUtils.keyCodes.enter)
    # Note that just typing the "home" key here doesn't work, for unknown reasons.
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

  moveCursorToCellLineEnd: ->
    UI.typeKey(KeyboardUtils.keyCodes.end)

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
    for _ in [0..(Math.floor(@visibleRowCount() / 2))]
      UI.typeKey(KeyboardUtils.keyCodes.downArrow)

  scrollHalfPageUp: ->
    for _ in [0..(Math.floor(@visibleRowCount() / 2))]
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

  #
  # Formatting
  #
  wrap: -> KeyboardUtils.simulateClick(@getToolbarButton(@buttons.wrap))
  overflow: -> KeyboardUtils.simulateClick(@getToolbarButton(@buttons.overflow))
  clip: -> KeyboardUtils.simulateClick(@getToolbarButton(@buttons.clip))
  alignLeft: -> KeyboardUtils.simulateClick(@getToolbarButton(@buttons.left))
  alignCenter: -> KeyboardUtils.simulateClick(@getToolbarButton(@buttons.center))
  alignRight: -> KeyboardUtils.simulateClick(@getToolbarButton(@buttons.right))
