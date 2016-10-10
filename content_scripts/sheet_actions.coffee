window.SheetActions =
  menuItems:
    copy: "Copy"
    deleteRow: "Delete row"
    deleteValues: "Delete values"
    rowAbove: "Row above"
    rowBelow: "Row below"
    # The "moveRowUp" menu item won't yet exist if multiple rows are selected.
    moveRowUp: "Move row up"
    moveRowDown: "Move row down"
    moveRowsUp: "Move rows up"
    moveRowsDown: "Move rows down"
    moveColumnLeft: "Move column left"
    moveColumnRight: "Move column right"
    moveColumnsLeft: "Move columns left"
    moveColumnsRight: "Move columns right"
    paste: "Paste"
    undo: "Undo"
    redo: "Redo"
    fullScreen: "Full screen"

  buttons:
    center: ["Horizontal align", "Center"]
    clip: ["Text wrapping", "Clip"]
    left: ["Horizontal align", "Left"]
    right: ["Horizontal align", "Right"]
    overflow: ["Text wrapping", "Overflow"]
    wrap: ["Text wrapping", "Wrap"]

  # You can find the names of these color swatches by hoverig over the swatches and seeing the tooltip.
  colors:
    white: "white"
    lightYellow3: "light yellow 3"
    lightCornflowBlue3: "light cornflower blue 3"
    lightPurple3: "light purple 3"
    lightRed3: "light red 3"
    lightGray2: "light gray 2"

  # A mapping of button-caption to DOM element.
  menuItemElements: {}

  clickToolbarButton: (captionList) ->
    # Sometimes a toolbar button won't exist in the DOM until its parent has been clicked, so we click all of
    # its parents in sequence.
    for caption in captionList
      el = document.querySelector("*[aria-label='#{caption}']")
      unless el
        console.log("Couldn't find the element for the button labeled #{caption} in #{captionList}")
        return
      KeyboardUtils.simulateClick(el)

  # Returns the DOM element of the menu item with the given caption. Prints a warning if a menu item isn't
  # found (since this is a common source of errors in SheetKeys) unless silenceWarning = true.
  getMenuItem: (caption, silenceWarning = false) ->
    item = @menuItemElements[caption]
    return item if item
    item = @findMenuItem(caption)
    unless item
      console.log("Warning: could not find menu item with caption #{caption}") unless silenceWarning
      return null
    return @menuItemElements[caption] = item

  findMenuItem: (caption) ->
    menuItems = document.querySelectorAll(".goog-menuitem")
    for menuItem in menuItems
      label = menuItem.innerText;
      if (label && label.indexOf(caption) == 0)
        return menuItem
    null

  # Returns the color palette button corresponding to the given color name.
  # type: either "font" or "cell", depending on which color you want to change.
  getColorButton: (color, type) ->
    selector = "*[aria-label='#{color}']"
    buttons = document.querySelectorAll(selector)
    # The divs for a color can disappear from the DOM. To reactivate them, click on the color palettes button.
    if buttons.length == 0
      paletteButton = document.querySelector("*[aria-label='Fill color']")
      KeyboardUtils.simulateClick(paletteButton)
      KeyboardUtils.simulateClick(paletteButton) # Click twice to show and then hide the pallete popup.
    buttons = document.querySelectorAll(selector)
    console.log("Error: unable to find element:", selector) unless buttons.length > 0

    # There are 3 color palettes in the document. The first one is for fonts, the second for cell background
    # colors. The third is for an undiscovered use.
    switch type
      when "font" then buttons[0]
      when "cell" then buttons[1]

  changeFontColor: (color) -> KeyboardUtils.simulateClick(@getColorButton(color, "font"))
  changeCellColor: (color) -> KeyboardUtils.simulateClick(@getColorButton(color, "cell"))

  clickMenu: (itemCaption) -> KeyboardUtils.simulateClick(@getMenuItem(itemCaption))

  deleteRows: ->
     @clickMenu(@menuItems.deleteRow)
     # Clear any row-level selections we might've had.
     @unselectRow()
  preserveSelectedColumn: -> @previousColumnLeft = @selectedCellCoords().left

  restoreSelectedColumn: ->
    left = @previousColumnLeft
    top = @selectedCellCoords().top
    el = document.elementFromPoint(left, top)
    KeyboardUtils.simulateClick(el, left, top)

  selectedCellCoords: ->
    box = document.querySelector(".active-cell-border").getBoundingClientRect()
    # Offset this box by > 0 so we don't select the borders around the selected cell.
    # NOTE(philc): I've chosen 5 here instead of 1 because > 1 is required when the document is zoomed.
    margin = 5
    {top: box.top + margin, left: box.left + margin}

  selectRow: ->
    # Sheets allows you to type Shift+Space to select a row, but its behavior is buggy:
    # 1. Sometimes it doesn't select the whole row, so you need to type it twice.
    # 2. In some sheets, moving a row after selecting a row with shift+space deterministically causes columns
    #    to swap!

    # xOffset is 15px from the left edge of the cell border because we don't to mistakenly click on the
    # "unhide" arrow icon which is present when spreadsheet rows are hidden.
    xOffset = 15
    # yOffset is set to 10 because empirically it correctly selects the row even when the page is zoomed.
    yOffset = 10
    y = @selectedCellCoords().top + yOffset
    rowMarginEl = document.elementFromPoint(xOffset, y)
    KeyboardUtils.simulateClick(rowMarginEl, xOffset, y)

  selectColumn: ->
    # Sheets allows you to type Alt+Space to select a column. Similar to `selectRow`, using that shortcut
    # has issues, so here we click on the appropriate column.
    activeCellLeft = document.querySelector(".active-cell-border").getBoundingClientRect().left
    c = 25
    # The column header is at the top of the grid portion of the UI (the waffle container).
    gridTop = document.getElementById("waffle-grid-container").getBoundingClientRect().top
    colMarginEl = document.elementFromPoint(activeCellLeft + c, gridTop)
    KeyboardUtils.simulateClick(colMarginEl, activeCellLeft + c, gridTop + 1) # +1 was chosen here empirically

  unselectRow: ->
    oldY = @cellCursorY()
    # Typing any arrow key will unselect the current selection.
    UI.typeKey(KeyboardUtils.keyCodes.downArrow)
    # If the cursor moved after we typed our arrow key, undo this selection change.
    if oldY != @cellCursorY()
      UI.typeKey(KeyboardUtils.keyCodes.upArrow)

  cellCursorY: ->
    # This is an approximate estimation of where the cell cursor is relative to the upper left corner of the
    # sptreasheet canvas.
    document.querySelector(".autofill-cover").getBoundingClientRect().top

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
    # In normal mode, where we have just a single cell selected, restore the column after moving the row.
    @preserveSelectedColumn() if UI.mode == "normal"
    @selectRow()
    if @getMenuItem(@menuItems.moveRowUp, true)
      @clickMenu(@menuItems.moveRowUp)
    else
      @clickMenu(@menuItems.moveRowsUp)
    if UI.mode == "normal"
      SheetActions.unselectRow()
      @restoreSelectedColumn()

  moveRowsDown: ->
    @preserveSelectedColumn() if UI.mode == "normal"
    @selectRow()
    if @getMenuItem(@menuItems.moveRowDown, true)
      @clickMenu(@menuItems.moveRowDown)
    else
      @clickMenu(@menuItems.moveRowsDown)

    if UI.mode == "normal"
      SheetActions.unselectRow()
      @restoreSelectedColumn()

  moveColumnsLeft: ->
    @selectColumn()
    if @getMenuItem(@menuItems.moveColumnLeft, true)
      @clickMenu(@menuItems.moveColumnLeft)
    else
      @clickMenu(@menuItems.moveColumnsLeft)

  moveColumnsRight: ->
    @selectColumn()
    if @getMenuItem(@menuItems.moveColumnRight, true)
      @clickMenu(@menuItems.moveColumnRight)
    else
      @clickMenu(@menuItems.moveColumnsRight)

  #
  # Editing
  #
  undo: -> @clickMenu(@menuItems.undo)
  redo: -> @clickMenu(@menuItems.redo)

  clear: -> @clickMenu(@menuItems.deleteValues)

  # Creates a row below and begins editing it.
  openRowBelow: ->
    @clickMenu(@menuItems.rowBelow)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  openRowAbove: ->
    @clickMenu(@menuItems.rowAbove)
    UI.typeKey(KeyboardUtils.keyCodes.enter)

  # Like openRowBelow, but does not enter insert mode.
  insertRowBelow: -> @clickMenu(@menuItems.rowBelow)
  insertRowAbove: -> @clickMenu(@menuItems.rowAbove)

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

  copyRow: ->
    @selectRow()
    @clickMenu(@menuItems.copy)
    @unselectRow()

  copy: ->
    @clickMenu(@menuItems.copy)
    @unselectRow()

  paste: ->
    @clickMenu(@menuItems.paste)
    @unselectRow()

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

  # NOTE(philc): I couldn't reliably detect the selected font size for the current cell, and so I couldn't
  # implement increaes font / decrease font commands.
  getFontSizeMenu: -> @getMenuItem("6").parentNode
  activateFontSizeMenu: ->
     KeyboardUtils.simulateClick(@getMenuItem("Font size"))
     # It's been shown; hide it again.
     @getFontSizeMenu().style.display = "none"

  setFontSize10: ->
    @activateFontSizeMenu()
    KeyboardUtils.simulateClick(@getMenuItem("10"))

  setFontSize8: ->
    @activateFontSizeMenu()
    KeyboardUtils.simulateClick(@getMenuItem("8"))

  wrap: -> @clickToolbarButton(@buttons.wrap)
  overflow: -> @clickToolbarButton(@buttons.overflow)
  clip: -> @clickToolbarButton(@buttons.clip)
  alignLeft: -> @clickToolbarButton(@buttons.left)
  alignCenter: -> @clickToolbarButton(@buttons.center)
  alignRight: -> @clickToolbarButton(@buttons.right)
  colorCellWhite: -> @changeCellColor(@colors.white)
  colorCellLightYellow3: -> @changeCellColor(@colors.lightYellow3)
  colorCellLightCornflowerBlue3: -> @changeCellColor(@colors.lightCornflowBlue3)
  colorCellLightPurple: -> @changeCellColor(@colors.lightPurple3)
  colorCellLightRed3: -> @changeCellColor(@colors.lightRed3)
  colorCellLightGray2: -> @changeCellColor(@colors.lightGray2)

  #
  # Misc
  #

  toggleFullScreen: ->
    @clickMenu(@menuItems.fullScreen)
    # After entering full-screen mode, immediately dismiss the notification the Google Docs shows.
    # Note that the DOM element is only available a second after toggling fullscreen.
    setTimeout((=> @dismissFullScreenNotificationMessage()), 250)

  dismissFullScreenNotificationMessage: ->
    dismissButton = document.querySelector("#docs-butterbar-container .docs-butterbar-link")
    # Ensure we don't accidentally find and click on another HUD notification which is not for dismissing
    # the full screen notification.
    if dismissButton && dismissButton.innerText == "Dismiss"
      KeyboardUtils.simulateClick(dismissButton)

  # Returns the value of the current cell.
  getCellValue: -> document.querySelector("#t-formula-bar-input-container").textContent

  # Opens a new tab using the current cell's value as the URL.
  openCellAsUrl: ->
    url = @getCellValue().trim()
    # Some cells can contain a HYPERLINK("url", "caption") value. If so, assume that's the URL we want to open
    match = url.match(/HYPERLINK\("(.+?),.+?"\)/)
    url = match[1] if match
    window.open(url, "_blank")
