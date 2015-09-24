UI =
  keyQueue: []
  ignoreNextKey: false
  handledCurrentKey: false
  # An arbitrary limit that should instead be equal to the longest key sequence that's actually bound.
  maxBindingLength: 2
  mode: "normal" # One of "normal" or "insert".
  # Keys which were typed recently
  keyQueue: []

  enterInsertMode: ->
    console.log "entering insert mode"
    @mode = "insert"
    @ignoreNextKey = true
    # TODO(philc):
    el = document.activeElement
    # TODO(philc): We should only enter insert mode if google docs thinks the cursor is positioned on a cell.
    return unless el.classList.contains("cell-input")
    console.log "Issuing enter"
    KeyboardUtils.simulateKeypress(el, KeyboardUtils.keyCodes.enter)

  exitInsertMode: ->
    @mode = "normal"
    @ignoreNextKey = true
    KeyboardUtils.simulateKeypress(el, KeyboardUtils.keyCodes.ESC)

  testCommand: ->
    console.log "test command executed"

  # We inject the page_script into the page so that we can simulate keypress events, which must be done by a
  # page script, and not a content script.
  # See here for docs on how to inject page scripts: http://stackoverflow.com/a/9517879/46237
  injectPageScript: ->
    script = document.createElement('script');
    script.src = chrome.extension.getURL('page_scripts/page_script.js')
    document.documentElement.appendChild(script)

  isEditable: (el) ->
    type = element.tagName.toLowerCase()
    el.isContentEditable || tagName == "input" || tagName == "textarea"

  onFocus: (e) ->
    console.log "onFocus", e
    el = event.target
    @mode = "insert"

  onBlur: (e) ->
    @mode = "normal" if @mode == "insert"

  init: ->
    # For clarity and efficiency, don't run inside of an iframe (Google sheets loads some iframes in the page)
    return unless (self == top)
    @injectPageScript()
    window.addEventListener("focus", (e) => @onFocus(e))
    window.addEventListener("blur", (e) => @onBlur(e))
    # Key event handlers fire on window before they do on document. Prefer window for key events so the page
    # can't set handlers to grab keys before this extension does.
    window.addEventListener("keydown", ((e) => @onKeydown(e)), true)
    window.addEventListener("keypress", ((e) => @onKeypress(e)), true)
    window.addEventListener("keyup", ((e) => @onKeyup(e)), true)
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
         document.querySelector(".active-cell-border").parentNode
         console.log("received test event", e)
         KeyboardUtils.simulateKeypress(document.body, KeyboardUtils.keyCodes.enter)
         )

      document.body.appendChild(button))

  cancelEvent: (e) ->
    e.preventDefault()
    e.stopPropagation()

  onKeypress: (e) ->
    console.log "keypress", e.keyCode, e.keyIdentifier, @handledCurrentKey
    return
    @cancelEvent(e) if @handledCurrentKey

  onKeyup: (e) ->
    console.log "keyup", e.keyCode, e.keyIdentifier, @handledCurrentKey
    return
    if @handledCurrentKey
      @cancelEvent(e)
      @handledCurrentKey = false

  onKeydown: (e) ->
    keyString = KeyboardUtils.getKeyString(e)
    console.log ">>>> keydown keyString:", keyString, e.keyCode, e.keyIdentifier, @handledCurrentKey
    console.log e
    if @ignoreKeys
      console.log "ignoring"
      return
    if @ignoreNextKey
      console.log "ignoring this keydown"
      @ignoreNextKey = false
      return
    return unless keyString
    if keyString == "esc"
      if @mode == "insert"
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
          # @handledCurrentKey = true
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
    @typeKey(KeyboardUtils.keyCodes.downArrow)
    return
    KeyboardUtils.simulateKeypress(document.activeElement, KeyboardUtils.keyCodes.upArrow)

  moveDown: ->
    @typeKey(KeyboardUtils.keyCodes.downArrow)
    return
    @nextFrame(=>
      console.log "moving down"
      # console.log "moving down", document.activeElement
      @typeKey(65, "U+0041"))

  moveLeft: ->
    KeyboardUtils.simulateKeypress(document.activeElement, KeyboardUtils.keyCodes.leftArrow)

  moveRight: ->
    KeyboardUtils.simulateKeypress(document.activeElement, KeyboardUtils.keyCodes.rightArrow)

keyBindings =
  "i": UI.enterInsertMode.bind(UI)
  "t": UI.testCommand.bind(UI)
  "k": UI.moveUp.bind(UI)
  "j": UI.moveDown.bind(UI)
  # TODO(philc): Support multi-letter commands, like d,d
  "d": SheetActions.deleteRows.bind(SheetActions)

UI.init()
