# This script gets inserted into the page by our content script.
# It receives requests from the content script to simulate keypresses.
# Messages are passed via "sheetkeys-simulate-keydown" events dispatched on window.

# How to simulate a keypress in Chrome: http://stackoverflow.com/a/10520017/46237
# Note that we have to do this simulation in an injected script, because events dispatched by content scripts
# do not preserve overridden properties.
# - args: an object with keys keyCode, shiftKey
simulateKeypress = (el, args) ->
  type = "keydown"
  keyIdentifier = null
  eventType = "keydown"
  # How to do this in Chrome: http://stackoverflow.com/q/10455626/46237
  event = document.createEvent("KeyboardEvent")
  Object.defineProperty(event, "keyCode", get : -> @keyCodeVal)
  Object.defineProperty(event, "which", get: -> @keyCodeVal)
  Object.defineProperty(event, "keyIdentifier", get: -> keyIdentifier)
  # eventName, canBubble, canceable, view, keyIdentifier string, ?, meta, ?, ?, shift, ?, keyCode, ?
  event.initKeyboardEvent(eventType, true, true, document.defaultView, null,
    false, false, false, args.shiftKey, false, args.keyCode, args.keyCode)
  event.keyCodeVal = args.keyCode
  event.keyIdentifier = keyIdentifier
  el.dispatchEvent(event)

jsonEl = document.createElement("div")
jsonEl.style.display = "none"
jsonEl.id = "sheetkeys-json-message"
document.addEventListener("DOMContentLoaded", -> document.body.appendChild(jsonEl))

window.addEventListener "sheetkeys-simulate-keydown", (e) ->
  console.log "got simulate keydown event", e
  editorEl = document.getElementById("waffle-rich-text-editor")
  args = JSON.parse(jsonEl.innerText)
  console.log ">>>> args:", args
  console.log editorEl
  simulateKeypress(editorEl, args)
