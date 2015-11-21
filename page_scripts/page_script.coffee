# This script gets inserted into the page by our content script.
# It receives requests from the content script to simulate keypresses.
# Messages are passed via "sheetkeys-simulate-keydown" events dispatched on window.

# How to simulate a keypress in Chrome: http://stackoverflow.com/a/10520017/46237
# Note that we have to do this simulation in an injected script, because events dispatched by content scripts
# do not preserve overridden properties.
# - args: an object with keys keyCode, shiftKey
simulateKeyEvent = (eventType, el, args) ->
  # How to do this in Chrome: http://stackoverflow.com/q/10455626/46237
  event = document.createEvent("KeyboardEvent")
  Object.defineProperty(event, "keyCode", get : -> @keyCodeVal)
  Object.defineProperty(event, "which", get: -> @keyCodeVal)
  # eventName, canBubble, canceable, view, keyIdentifier string, ?, control, ?, shift, meta, keyCode, ?
  event.initKeyboardEvent(eventType, true, true, document.defaultView, "",
    false, args.mods.control, null, args.mods.shift, args.mods.meta, args.keyCode, args.keyCode)
  event.keyCodeVal = args.keyCode
  # console.log "Simulating keyboard event:", args.keyCode, args, event
  el.dispatchEvent(event)

jsonEl = document.createElement("div")
jsonEl.style.display = "none"
jsonEl.id = "sheetkeys-json-message"
document.body.appendChild(jsonEl)

window.addEventListener "sheetkeys-simulate-key-event", (e) ->
  editorEl = document.getElementById("waffle-rich-text-editor")
  args = JSON.parse(jsonEl.innerText)
  # TODO(philc): We simulate all three events because it's needed for some keystrokes to be recognized by
  # sheets (in particular, the Enter key).
  simulateKeyEvent("keydown", editorEl, args)
  simulateKeyEvent("keypress", editorEl, args)
  simulateKeyEvent("keyup", editorEl, args)

getClipboardContents = ->
  input = document.createElement("textarea")
  document.body.appendChild(input)
  input.focus()
  document.execCommand("paste");
  value = input.value
  input.remove()
  return value

window.addEventListener "sheetkeys-get-cell-value", (e) ->
  # It would be nice if we could obtain the value of the cell directly, but for now, we copy and paste it to
  # read it. This is done by this page script because content scripts don't have access to the clipboard.
  document.execCommand("copy")
  jsonEl.innerText = JSON.stringify({value: getClipboardContents()})
