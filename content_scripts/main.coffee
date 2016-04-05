# Utilities
clone = (o) -> extend({}, o)
extend = (o, properties) ->
  for key, val of properties
    o[key] = val
  o

# This makes the chrome at the top auto-hide onmouseover.
# The chrome takes up a lot of screen real estate and doesn't add much utility when you have shortcuts for
# everything, and the sheet's name is already shown in the tab title.
window.AutoHider = class
  collapsedHeight: 7

  constructor: (@elementSelector) ->
    @injectCss()
    @paused = false
    @element = document.querySelector(@elementSelector)
    @element.addEventListener "mouseenter", (e) => @onMouseEnter(e)
    @element.addEventListener "mouseleave", (e) => @onMouseLeave(e)

  injectCss: ->
    # Set all child elements to opacity 0 so the top-level element is shown as a single collapsed bar of gray.
    css = "
      #{@elementSelector} {
        height: #{@collapsedHeight}px;
        background-color: #aaa;
        overflow: hidden;
      }
      #{@elementSelector} * { opacity: 0; }"
    @style = document.createElement("style")
    @style.type = "text/css"
    @style.appendChild(document.createTextNode(css))
    # document.head is not yet available in the DOM
    document.documentElement.appendChild(@style)

  onMouseEnter: ->
    if @hideTimer?
      clearTimeout(@hideTimer)
      return
    @showTimer = setTimeout((=>
      return if @paused
      @showTimer = null
      @showElement()),
      300)

  onMouseLeave: ->
    # TODO(philc): Also listen mouseenter/leave events on .goog-menu elements, so that the chrome bar doesn't
    # autohide if you're mousing over a menu.
    if @showTimer?
      # The user just quickly moved their mouse over the element, so don't expand it.
      clearTimeout(@showTimer)
      return
    @hideTimer = setTimeout((=>
      return if @paused
      @hideTimer = null
      @hideElement()),
      3000)

  showElement: ->
    @style.remove()

  hideElement: ->
    document.documentElement.appendChild(@style)

  pause: -> @paused = true
  resume: -> @paused = false

window.UI =
  # An arbitrary limit that should instead be equal to the longest key sequence that's actually bound.
  maxBindingLength: 3
  # Mode can be one of:
  # * normal
  # * insert: when editing a cell's contents
  # * disabled: when the cursor is on some other form field in Sheets, like the Find dialog.
  # * replace: when "r" has been typed, and we're waiting for the user to type a character to replace the
  #   cell's contents with.
  mode: "normal"
  # Keys which were typed recently
  keyQueue: []
  # A map of mode -> comma-separated keys -> bool. The keys are prefixes to the user's bound keybindings.
  keyBindingPrefixes: null
  richTextEditorId: "waffle-rich-text-editor"

  setMode: (mode) ->
    return if @mode == mode
    console.log "Entering #{mode} mode."
    @mode = mode
    @keyQueue = []

  enterVisualMode: -> @setMode("visual")

  # In this mode, entire lines are selected.
  enterVisualLineMode: ->
    SheetActions.selectRow()
    @setMode("visual")

  enterVisualColumnMode: ->
    SheetActions.selectColumn()
    @setMode("visual")

  exitVisualMode: ->
    SheetActions.unselectRow()
    @setMode("normal")

  # We inject the page_script into the page so that we can simulate keypress events, which must be done by a
  # page script, and not a content script.
  # See here for docs on how to inject page scripts: http://stackoverflow.com/a/9517879/46237
  injectPageScript: ->
    script = document.createElement("script")
    script.src = chrome.extension.getURL("page_scripts/page_script.js")
    document.documentElement.appendChild(script)

  isEditable: (el) ->
    tagName = el.tagName?.toLowerCase() # Note that the window object doesn't have a tagname.
    el.isContentEditable || tagName == "input" || tagName == "textarea"

  onFocus: (e) ->
    @setupEditor() unless @editor
    el = event.target
    if el.id == @richTextEditorId
      @setMode("normal") if @mode == "disabled"
    else if @isEditable(el)
      @setMode("disabled")

  setupEditor: ->
    unless @editor
      @editor = document.getElementById(@richTextEditorId)
      if @editor
        # Listen for when the editor's style attribute changes. This indicates that a cell is now being
        # edited, perhaps due to double clicking into a cell.
        observer = new MutationObserver((mutations) =>
          if @isEditorEditing() then @setMode("insert") else @setMode("normal"))
        observer.observe(@editor.parentNode,
          attributes: true
          attributeFilter: ["style"])

    @editor

  isEditorEditing: ->
    return false unless @editor
    # There's no obvious way to determine directly that the cell editor is currently editing a cell.
    # However, when this happens, the parent node of the editor gets a big long style attribute to portray
    # the cell editor input box.
    @editor.parentNode.getAttribute("style")?

  init: ->
    @injectPageScript()
    window.addEventListener("focus", ((e) => @onFocus(e)), true)
    # Key event handlers fire on window before they do on document. Prefer window for key events so the page
    # can't set handlers to grab keys before this extension does.
    window.addEventListener("keydown", ((e) => @onKeydown(e)), true)
    @keyBindingPrefixes = @buildKeyBindingPrefixes()
    @autoHider = new AutoHider("#docs-chrome")

  # Returns a map of (partial keyString) => is_bound?
  # Note that the keys only include partial keystrings for bindings. So the binding "dap" will add "d" and
  # "da" keys to this map, but not "dap".
  buildKeyBindingPrefixes: ->
    prefixes = {}
    for mode of keyBindings
      prefixes[mode] = {}
      modeKeyBindings = keyBindings[mode]
      for keyString, action of modeKeyBindings
        # If the bound action is null, then treat this key as unbound.
        continue unless action
        keys = keyString.split(",")
        for i in [0...keys.length-1]
          keyString = keys.slice(0, i+1).join(",")
          prefixes[mode][keyString] = true
    prefixes

  cancelEvent: (e) ->
    e.preventDefault()
    e.stopPropagation()

  onKeydown: (e) ->
    keyString = KeyboardUtils.getKeyString(e)
    # console.log "keydown event. keyString:", keyString, e.keyCode, e.keyIdentifier, e
    return if @ignoreKeys

    return unless keyString # Ignore key presses which are just modifiers.

    # In replace mode, we're waiting for one character to be typed, and we will replace the cell's contents
    # with that character and then return to normal mode.
    if @mode == "replace"
      if keyString == "esc"
        @cancelEvent(e)
        @setMode("normal")
      else
        SheetActions.changeCell()
        setTimeout((=> SheetActions.commitCellChanges()), 0)
      return

    @keyQueue.push(keyString)
    @keyQueue.shift() if @keyQueue.length > @maxBindingLength
    modeBindings = keyBindings[@mode] || []
    modePrefixes = @keyBindingPrefixes[@mode] || []
    # See if a bound command matches the typed key sequence. If so, execute it.
    # Prioritize longer bindings over shorter bindings.
    for i in [Math.min(@maxBindingLength, @keyQueue.length)..1]
      keySequence = @keyQueue.slice(@keyQueue.length - i, @keyQueue.length).join(",")
      # If this key could be part of one of the bound key bindings, don't pass it through to the page.
      # Also, if some longer binding partically matches this key sequence, then wait for more keys, and
      # don't immediately apply a shorter binding which also matches this key sequence.
      if modePrefixes[keySequence]
        @cancelEvent(e)
        return
      else if fn = modeBindings[keySequence]
        @keyQueue = []
        @cancelEvent(e)
        fn()
        return
    null

  typeKey: (keyCode, modifiers) ->
    unless keyCode?
      console.log("No keyCode provided to typeKey")
      return
    @ignoreKeys = true
    modifiers ||= {}
    document.getElementById("sheetkeys-json-message").innerText =
      JSON.stringify({keyCode: keyCode, mods: modifiers})
    window.dispatchEvent(new CustomEvent("sheetkeys-simulate-key-event", {}))
    @ignoreKeys = false

  deleteRows: ->
    SheetActions.deleteRows()
    # In case we're in visual mode, exit that mode and return to normal mode.
    @setMode("normal")

  replaceChar: -> @setMode("replace")

  toggleChromeVisibility: ->
    if @autoHider.paused
      @autoHider.resume()
      @autoHider.hideElement()
    else
      @autoHider.pause()
      @autoHider.showElement()

# Default keybindings.
# TODO(philc): Make these bindings customizable via preferences.
keyBindings =
  "normal":
    # Cursor movement
    "k": SheetActions.moveUp.bind(SheetActions)
    "j": SheetActions.moveDown.bind(SheetActions)
    "h": SheetActions.moveLeft.bind(SheetActions)
    "l": SheetActions.moveRight.bind(SheetActions)

    # Row & column movement
    "<C-J>": SheetActions.moveRowsDown.bind(SheetActions)
    "<C-K>": SheetActions.moveRowsUp.bind(SheetActions)
    "<C-H>": SheetActions.moveColumnsLeft.bind(SheetActions)
    # TODO(philc): remove this because it's custom to my configuration
    "BACKSPACE": SheetActions.moveColumnsLeft.bind(SheetActions)
    "<C-L>": SheetActions.moveColumnsRight.bind(SheetActions)

    # Editing
    "i": SheetActions.editCell.bind(SheetActions)
    "a": SheetActions.editCellAppend.bind(SheetActions)
    "u": SheetActions.undo.bind(SheetActions)
    "<C-r>": SheetActions.redo.bind(SheetActions)
    "r": UI.replaceChar.bind(UI)
    "o": SheetActions.openRowBelow.bind(SheetActions)
    "O": SheetActions.openRowAbove.bind(SheetActions)
    "s": SheetActions.insertRowBelow.bind(SheetActions)
    "S": SheetActions.insertRowAbove.bind(SheetActions)
    "d,d": UI.deleteRows.bind(UI)
    "x": SheetActions.clear.bind(SheetActions)
    "c,c": SheetActions.changeCell.bind(SheetActions)
    "y,y": SheetActions.copyRow.bind(SheetActions)
    # "Yank cell"
    "y,c": SheetActions.copy.bind(SheetActions)
    "p": SheetActions.paste.bind(SheetActions)

    # Selection
    "v": UI.enterVisualMode.bind(UI)
    "V": UI.enterVisualLineMode.bind(UI)
    "<A-v>": UI.enterVisualColumnMode.bind(UI)

    # Scrolling
    "<C-d>": SheetActions.scrollHalfPageDown.bind(SheetActions)
    "<C-u>": SheetActions.scrollHalfPageUp.bind(SheetActions)
    "g,g": SheetActions.scrollToTop.bind(SheetActions)
    "G": SheetActions.scrollToBottom.bind(SheetActions)

    # Tabs
    ">,>": SheetActions.moveTabRight.bind(SheetActions)
    "<,<": SheetActions.moveTabLeft.bind(SheetActions)
    "g,t": SheetActions.nextTab.bind(SheetActions)
    "g,T": SheetActions.prevTab.bind(SheetActions)
    "J": SheetActions.prevTab.bind(SheetActions)
    "K": SheetActions.nextTab.bind(SheetActions)

    # Formatting
    ";,w,w": SheetActions.wrap.bind(SheetActions)
    ";,w,o": SheetActions.overflow.bind(SheetActions)
    ";,w,c": SheetActions.clip.bind(SheetActions)
    ";,a,l": SheetActions.alignLeft.bind(SheetActions)
    ";,a,c": SheetActions.alignCenter.bind(SheetActions)
    ";,a,r": SheetActions.alignRight.bind(SheetActions)
    ";,c,w": SheetActions.colorCellWhite.bind(SheetActions)
    ";,c,y": SheetActions.colorCellLightYellow3.bind(SheetActions)
    ";,c,b": SheetActions.colorCellLightCornflowerBlue3.bind(SheetActions)
    ";,c,p": SheetActions.colorCellLightPurple.bind(SheetActions)
    ";,c,r": SheetActions.colorCellLightRed3.bind(SheetActions)
    ";,c,g": SheetActions.colorCellLightGray2.bind(SheetActions)
    ";,f,n": SheetActions.setFontSize10.bind(SheetActions) # Font size normal
    ";,f,s": SheetActions.setFontSize8.bind(SheetActions) # Font size small

    # Misc
    ";,w,m": UI.toggleChromeVisibility.bind(UI) # Mnemonic for "window maximize"
    ";,o": SheetActions.openCellAsUrl.bind(SheetActions)

  "insert":
    # In normal Sheets, esc takes you out of the cell and loses your edits. That's a poor experience for
    # people used to Vim. Now ESC will save your cell edits and put you back in normal mode.
    "esc": SheetActions.commitCellChanges.bind(SheetActions)
    # In form fields on Mac, C-e takes you to the end of the field. For some reason C-e doesn't work in
    # Sheets. Here, we fix that.
    "<C-e>": SheetActions.moveCursorToCellLineEnd.bind(SheetActions)

keyBindings.visual = extend clone(keyBindings.normal),
  "j": SheetActions.moveDownAndSelect.bind(SheetActions)
  "k": SheetActions.moveUpAndSelect.bind(SheetActions)
  "h": SheetActions.moveLeftAndSelect.bind(SheetActions)
  "l": SheetActions.moveRightAndSelect.bind(SheetActions)
  "y": SheetActions.copy.bind(SheetActions)
  "y,y": null # Unbind "copy row", because it's superceded by "copy"
  "esc": UI.exitVisualMode.bind(UI)

UI.init()
