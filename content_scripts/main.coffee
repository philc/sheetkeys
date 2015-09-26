window.UI =
  # An arbitrary limit that should instead be equal to the longest key sequence that's actually bound.
  maxBindingLength: 3
  mode: "normal" # One of "normal" or "insert".
  # Keys which were typed recently
  keyQueue: []
  # A map of mode -> comma-separated keys -> bool. The keys are prefixes to the user's bound keybindings.
  keyBindingPrefixes: null
  richTextEditorId: "waffle-rich-text-editor"

  enterInsertMode: ->
    el = document.activeElement
    # TODO(philc): We should only allow the insert mode command to enter a cell if the cursor is already on a
    # cell
    return unless el.classList.contains("cell-input")
    @setMode("insert")
    @typeKey(KeyboardUtils.keyCodes.enter)

  exitInsertMode: ->
    @setMode("normal")
    @typeKey(KeyboardUtils.keyCodes.esc)

  # Enter insert mode, but place the cursor at the end of the cell's contents.
  appendInsertMode: ->
    @enterInsertMode()
    @typeKey(KeyboardUtils.keyCodes.end)

  # This is for debugging purposes. TODO(philc): Delete this.
  debugOutputCommand: ->
    console.log "test command executed"

  setMode: (mode) ->
    return if @mode == mode
    console.log "Entering #{mode} mode."
    @mode = mode
    @keyQueue = []

  # We inject the page_script into the page so that we can simulate keypress events, which must be done by a
  # page script, and not a content script.
  # See here for docs on how to inject page scripts: http://stackoverflow.com/a/9517879/46237
  injectPageScript: ->
    script = document.createElement('script');
    script.src = chrome.extension.getURL('page_scripts/page_script.js')
    document.documentElement.appendChild(script)

  isEditable: (el) ->
    tagName = el.tagName?.toLowerCase() # Note that the window object doesn't have a tagname.
    el.isContentEditable || tagName == "input" || tagName == "textarea"

  onFocus: (e) ->
    @setupEditor() unless @editor
    el = event.target
    if el.id != @richTextEditorId && @isEditable(el)
      @setMode("insert")

  onBlur: (e) ->
    @setMode("insert") if @mode == "insert"

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
    # For clarity and efficiency, don't run inside of an iframe (Google sheets loads some iframes in the page)
    return unless (self == top)
    @injectPageScript()
    window.addEventListener("focus", ((e) => @onFocus(e)), true)
    window.addEventListener("blur", ((e) => @onBlur(e)), true)
    # Key event handlers fire on window before they do on document. Prefer window for key events so the page
    # can't set handlers to grab keys before this extension does.
    window.addEventListener("keydown", ((e) => @onKeydown(e)), true)

    @keyBindingPrefixes = @buildKeyBindingPrefixes()

  # Returns a map of keyString =>
  buildKeyBindingPrefixes: ->
    prefixes = {}
    for mode of keyBindings
      prefixes[mode] = {}
      for keyString of keyBindings
        keys = keyString.split(",")
        for i in [0..keys.length]
          keyString = keys.slice(0, i+1).join(",")
          prefixes[mode][keyString] = true
    prefixes

  cancelEvent: (e) ->
    e.preventDefault()
    e.stopPropagation()

  onKeydown: (e) ->
    keyString = KeyboardUtils.getKeyString(e)
    console.log "keydown event. keyString:", keyString, e.keyCode, e.keyIdentifier, e
    if @ignoreKeys
      console.log "ignoring"
      return

    return unless keyString # Ignore key presses which are just modifiers.

    @keyQueue.push(keyString)
    @keyQueue.shift() if @keyQueue.length > @maxBindingLength
    modeBindings = keyBindings[@mode] || []
    modePrefixes = @keyBindingPrefixes[@mode] || []
    # See if a command matches the typed key sequence, and execute it.
    # TODO(philc): Consider executing a simulated keypress on the next frame.
    for length in [1..@maxBindingLength]
      for i in [1..length]
        keySequence = @keyQueue.slice(@keyQueue.length - i, @keyQueue.length).join(",")
        if fn = modeBindings[keySequence]
          @keyQueue = []
          @cancelEvent(e)
          fn()
          return
        # If this key could be part of one of the bound key bindings, don't pass it through to the page.
        else if modePrefixes[keySequence]
          @cancelEvent(e)
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

# Default keybindings.
# TODO(philc): Make these bindings customizable via preferences.
keyBindings =
  "normal":
    # Movement
    "k": SheetActions.moveUp.bind(SheetActions)
    "j": SheetActions.moveDown.bind(SheetActions)
    "h": SheetActions.moveLeft.bind(SheetActions)
    "l": SheetActions.moveRight.bind(SheetActions)

    # Row movement
    "<C-J>": SheetActions.moveRowsDown.bind(SheetActions)
    "<C-K>": SheetActions.moveRowsUp.bind(SheetActions)
    "<C-H>": SheetActions.moveColumnsLeft.bind(SheetActions)
    "<C-L>": SheetActions.moveColumnsRight.bind(SheetActions)

    # Editing
    "i": UI.enterInsertMode.bind(UI)
    "a": UI.appendInsertMode.bind(UI)
    "t": UI.debugOutputCommand.bind(UI)
    "u": SheetActions.undo.bind(SheetActions)
    "<C-r>": SheetActions.redo.bind(SheetActions)
    "o": SheetActions.openRowBelow.bind(SheetActions)
    "O": SheetActions.openRowAbove.bind(SheetActions)
    "d,d": SheetActions.deleteRows.bind(SheetActions)
    "x": SheetActions.clear.bind(SheetActions)
    "c,c": SheetActions.changeCell.bind(SheetActions)

  "insert":
    # In normal Sheets, esc takes you out of the cell and loses your edits. That's a poor experience for
    # people used to Vim. Now ESC will save your cell edits and put you back in normal mode.
    "esc": SheetActions.commitCellChanges.bind(SheetActions)

UI.init()
