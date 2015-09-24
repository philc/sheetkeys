UI =
  keyQueue: []
  # An arbitrary limit that should instead be equal to the longest key sequence that's actually bound.
  maxBindingLength: 2
  mode: "normal" # One of "normal" or "insert".
  # Keys which were typed recently
  keyQueue: []
  richTextEditorId: "waffle-rich-text-editor"

  enterInsertMode: ->
    el = document.activeElement
    # TODO(philc): We should only enter insert mode if google docs thinks the cursor is positioned on a cell.
    # Is this the right condition?
    return unless el.classList.contains("cell-input")
    @mode = "insert"
    @typeKey(KeyboardUtils.keyCodes.enter)

  exitInsertMode: ->
    @mode = "normal"
    @typeKey(KeyboardUtils.keyCodes.ESC)

  # This is for debugging purposes. TODO(philc): Delete this.
  debugOutputCommand: ->
    console.log "test command executed"

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
    el = event.target
    if el.id != @richTextEditorId && @isEditable(el)
      console.log "switching to insert mode"
      @mode = "insert"
    @setupEditor() unless @editor

  onBlur: (e) ->
    @mode = "normal" if @mode == "insert"

  setupEditor: ->
    unless @editor
      @editor = document.getElementById(@richTextEditorId)
      if @editor
        # Listen for when the editor's style attribute changes. This indicates that a cell is now being
        # edited, perhaps due to double clicking into a cell.
        observer = new MutationObserver((mutations) =>
          if @isEditorEditing() then @mode = "insert" else @mode = "normal")
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
    window.addEventListener "mouseup", (e) =>
      console.log "click received. Editing?", @isEditorEditing()
    setInterval((=> console.log "editing?", @isEditorEditing()), 1000)

    window.addEventListener("blur", ((e) => @onBlur(e)), true)
    # Key event handlers fire on window before they do on document. Prefer window for key events so the page
    # can't set handlers to grab keys before this extension does.
    window.addEventListener("keydown", ((e) => @onKeydown(e)), true)
    # window.addEventListener("keypress", ((e) => @onKeypress(e)), true)
    # window.addEventListener("keyup", ((e) => @onKeyup(e)), true)
    window.addEventListener("test", (e) =>
      console.log("received test event", e)
      @enterInsertMode()
    )
    window.addEventListener("load", =>
      button = document.createElement("button")
      s = button.style
      s.position = "absolute"
      s.top = "0"
      s.right = "0"
      button.innerHTML = "test"
      button.addEventListener("click", =>
         console.log("received test event", e)
         KeyboardUtils.simulateKeypress(document.body, KeyboardUtils.keyCodes.enter)
         )

      document.body.appendChild(button))

  cancelEvent: (e) ->
    e.preventDefault()
    e.stopPropagation()

  # onKeypress: (e) ->
  #   console.log "keypress", e.keyCode, e.keyIdentifier, @handledCurrentKey
  #   return
  #   # @cancelEvent(e) if @handledCurrentKey

  # onKeyup: (e) ->
  #   console.log "keyup", e.keyCode, e.keyIdentifier, @handledCurrentKey
  #   return
  #   if @handledCurrentKey
  #     @cancelEvent(e)
  #     @handledCurrentKey = false

  onKeydown: (e) ->
    keyString = KeyboardUtils.getKeyString(e)
    console.log ">>>> keydown keyString:", keyString, e.keyCode, e.keyIdentifier, e
    if @ignoreKeys
      console.log "ignoring"
      return

    return unless keyString # Ignore key presses which are just modifiers.

    if @mode == "insert"
      if keyString == "esc"
        @cancelEvent(e)
        @exitInsertMode()
      return

    @keyQueue.push(keyString)
    @keyQueue.shift() if @keyQueue.length > @maxBindingLength
    # See if a command matches the typed key sequence, and execute it.
    # TODO(philc): Consider executing a simulated keypress on the next frame.
    for length in [1..@maxBindingLength]
      for i in [1..length]
        keySequence = @keyQueue.slice(@keyQueue.length - i, @keyQueue.length).join(",")
        if fn = keyBindings[keySequence]
          @keyQueue = []
          @cancelEvent(e)
          fn()
          return
    null

  typeKey: (keyCode, keyIdentifier) ->
    @ignoreKeys = true
    document.getElementById("sheetkeys-json-message").innerText = JSON.stringify({keyCode: keyCode})
    window.dispatchEvent(new CustomEvent("sheetkeys-simulate-keydown", {}))
    @ignoreKeys = false

  nextFrame: (fn) ->
    setTimeout(fn, 0)

  moveUp: ->
    @typeKey(KeyboardUtils.keyCodes.upArrow)

  moveDown: ->
    @typeKey(KeyboardUtils.keyCodes.downArrow)

  moveLeft: ->
    KeyboardUtils.simulateKeypress(document.activeElement, KeyboardUtils.keyCodes.leftArrow)

  moveRight: ->
    KeyboardUtils.simulateKeypress(document.activeElement, KeyboardUtils.keyCodes.rightArrow)

# Default keybindings.
# TODO(philc): Make these bindings customizable via preferences.
keyBindings =
  "i": UI.enterInsertMode.bind(UI)
  "t": UI.debugOutputCommand.bind(UI)
  "k": UI.moveUp.bind(UI)
  "j": UI.moveDown.bind(UI)
  # TODO(philc): Support multi-letter commands, like d,d
  "d": SheetActions.deleteRows.bind(SheetActions)

UI.init()
