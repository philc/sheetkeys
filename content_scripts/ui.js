// Utilities
const clone = o => extend({}, o);
var extend = function(o, properties) {
  for (let key in properties) {
    const val = properties[key];
    o[key] = val;
  }
  return o;
};

// Add an event listener which removes itself once the event is fired once.
const addOneTimeListener = function(dispatcher, eventType, listenerFn) {
  const handlerFn = function(e) {
    dispatcher.removeEventListener(eventType, handlerFn, true);
    return listenerFn(e);
  };
  return dispatcher.addEventListener(eventType, handlerFn, true);
};

UI = {
  // An arbitrary limit that should instead be equal to the longest key sequence that's actually bound.
  maxBindingLength: 3,
  // Mode can be one of:
  // * normal
  // * insert: when editing a cell's contents
  // * disabled: when the cursor is on some other form field in Sheets, like the Find dialog.
  // * replace: when "r" has been typed, and we're waiting for the user to type a character to replace the
  //   cell's contents with.
  mode: "normal",
  // Keys which were typed recently
  keyQueue: [],
  // A map of mode -> comma-separated keys -> bool. The keys are prefixes to the user's bound keybindings.
  keyBindingPrefixes: null,
  richTextEditorId: "waffle-rich-text-editor",

  init() {
    this.injectPageScript();
    window.addEventListener("focus", (e => this.onFocus(e)), true);
    // When we first focus the spreadsheet, if we're in fullscreen mode, dismiss Sheet's "info" message.
    addOneTimeListener(window, "focus", () => {
      // We have to wait 1 second because the DOM is not yet ready to be clicked on.
      return setTimeout(() => SheetActions.dismissFullScreenNotificationMessage(), 1000);
    });

    // Key event handlers fire on window before they do on document. Prefer window for key events so the page
    // can't set handlers to grab keys before this extension does.
    window.addEventListener("keydown", (e => this.onKeydown(e)), true);

    this.loadUserKeybindings();
  },

  setMode(mode) {
    if (this.mode === mode) { return; }
    console.log(`Entering ${mode} mode.`);
    this.mode = mode;
    this.keyQueue = [];
  },

  enterVisualMode() { this.setMode("visual"); },

  // In this mode, entire lines are selected.
  enterVisualLineMode() {
    SheetActions.preserveSelectedColumn();
    SheetActions.selectRow();
    this.setMode("visualLine");
  },

  enterVisualColumnMode() {
    SheetActions.selectColumn();
    this.setMode("visualColumn");
  },

  // Exits the current mode and transitions to normal mode.
  exitMode() {
    switch (this.mode) {
    case "visual":
      SheetActions.unselectRow();
      this.setMode("normal");
      break;
    case "visualLine":
    case "visualColumn":
      SheetActions.unselectRow();
      SheetActions.restoreSelectedColumn();
      this.setMode("normal");
      break;
    case "normal": // Do nothing.
      break;
    default:
      throw `Attempted to exit an unknown mode: ${this.mode}`;
      break;
    }
  },

  // We inject the page_script into the page so that we can simulate keypress events, which must be done by a
  // page script, and not a content script.
  // See here for docs on how to inject page scripts: http://stackoverflow.com/a/9517879/46237
  injectPageScript() {
    const script = document.createElement("script");
    script.src = chrome.extension.getURL("page_scripts/page_script.js");
    return document.documentElement.appendChild(script);
  },

  isEditable(el) {
    // Note that the window object doesn't have a tagname.
    const tagName = (el.tagName? el.tagName.toLowerCase() : null);
    return el.isContentEditable || tagName === "input" || tagName === "textarea";
  },

  onFocus(e) {
    if (!this.editor) { this.setupEditor(); }
    const el = event.target;
    if (el.id === this.richTextEditorId) {
      if (this.mode === "disabled") {
        this.setMode("normal");
      }
    } else if (this.isEditable(el)) {
      this.setMode("disabled");
    }
  },

  setupEditor() {
    if (!this.editor) {
      this.editor = document.getElementById(this.richTextEditorId);
      if (this.editor) {
        // Listen for when the editor's style attribute changes. This indicates that a cell is now being
        // edited, perhaps due to double clicking into a cell.
        const observer = new MutationObserver(mutations => {
          this.isEditorEditing() ? this.setMode("insert") : this.setMode("normal");
        });
        observer.observe(this.editor.parentNode, {
          attributes: true,
          attributeFilter: ["style"]
        });
      }
    }

    return this.editor;
  },

  isEditorEditing() {
    if (!this.editor) { return false; }
    // There's no obvious way to determine directly that the cell editor is currently editing a cell.
    // However, when this happens, the parent node of the editor gets a big long style attribute to portray
    // the cell editor input box.
    return (this.editor.parentNode.getAttribute("style") != null);
  },

  loadUserKeybindings() {
    chrome.storage.sync.get(null, (settings) => {
      let userBindings = (settings && settings.keyMappings) ? Settings.parse(settings.keyMappings) : {};
      let bindings = {};
      // Perform a deep merge with the default keybindings.
      for (let mode in Commands.defaultMappings) {
        bindings[mode] = clone(Commands.defaultMappings[mode]);
        extend(bindings[mode], userBindings[mode]);
      }
      this.keyBindings = bindings;
      this.keyBindingPrefixes = this.buildKeyBindingPrefixes(bindings);
    });
  },

  // Returns a map of (partial keyString) => is_bound?
  // Note that the keys only include partial keystrings for bindings. So the binding "dap" will add "d" and
  // "da" keys to this map, but not "dap".
  buildKeyBindingPrefixes(keyBindings) {
    const prefixes = {};
    for (let mode in keyBindings) {
      prefixes[mode] = {};
      const modeKeyBindings = keyBindings[mode];
      for (let keyString in modeKeyBindings) {
        // If the bound action is null, then treat this key as unbound.
        const action = modeKeyBindings[keyString];
        if (!action) { continue; }
        const keys = keyString.split(",");
        for (let i = 0; i < keys.length - 1; i++) {
          keyString = keys.slice(0, i+1).join(",");
          prefixes[mode][keyString] = true;
        }
      }
    }
    return prefixes;
  },

  cancelEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  },

  onKeydown(e) {
    const keyString = KeyboardUtils.getKeyString(e);
    // console.log "keydown event. keyString:", keyString, e.keyCode, e.keyIdentifier, e
    if (this.ignoreKeys) { return; }

    if (!keyString) { return; } // Ignore key presses which are just modifiers.

    // In replace mode, we're waiting for one character to be typed, and we will replace the cell's contents
    // with that character and then return to normal mode.
    if (this.mode === "replace") {
      if (keyString === "esc") {
        this.cancelEvent(e);
        this.setMode("normal");
      } else {
        SheetActions.changeCell();
        setTimeout((() => SheetActions.commitCellChanges()), 0);
      }
      return;
    }

    this.keyQueue.push(keyString);
    if (this.keyQueue.length > this.maxBindingLength) { this.keyQueue.shift(); }
    const modeBindings = this.keyBindings[this.mode] || [];
    const modePrefixes = this.keyBindingPrefixes[this.mode] || [];
    // See if a bound command matches the typed key sequence. If so, execute it.
    // Prioritize longer bindings over shorter bindings.
    for (let i = Math.min(this.maxBindingLength, this.keyQueue.length); i >= 1; i--) {
      var fn;
      const keySequence = this.keyQueue.slice(this.keyQueue.length - i, this.keyQueue.length).join(",");
      // If this key could be part of one of the bound key bindings, don't pass it through to the page.
      // Also, if some longer binding partically matches this key sequence, then wait for more keys, and
      // don't immediately apply a shorter binding which also matches this key sequence.
      if (modePrefixes[keySequence]) {
        this.cancelEvent(e);
        return;
      }

      if (commandName = modeBindings[keySequence]) {
        this.keyQueue = [];
        this.cancelEvent(e);
        Commands.commands[commandName].fn();
      }
    }
  },

  typeKey(keyCode, modifiers) {
    if (keyCode == null) { throw "The keyCode provided to typeKey() is null."; }
    this.ignoreKeys = true;
    if (!modifiers) { modifiers = {}; }
    document.getElementById("sheetkeys-json-message").innerText =
      JSON.stringify({keyCode, mods: modifiers});
    window.dispatchEvent(new CustomEvent("sheetkeys-simulate-key-event", {}));
    this.ignoreKeys = false;
  },

  deleteRows() {
    SheetActions.deleteRows();
    // In case we're in visual mode, exit that mode and return to normal mode.
    this.setMode("normal");
  },

  replaceChar() { this.setMode("replace"); },

  // TODO(philc): Consider moving this to SheetActions.
  reflowGrid() {
    // When you hide a DOM element, Google's Waffle grid doesn't know to reflow and take up the full viewport.
    // You can trigger a reflow by resizing the browser or by clicking on the Explore button in the lower-left
    // corner.
    const exploreButton = document.querySelector(".waffle-assistant-entry [role=button]");
    KeyboardUtils.simulateClick(exploreButton);
    KeyboardUtils.simulateClick(exploreButton); // Click twice to show and then hide.
  },

  reloadPage() { window.location.reload(); },
};

UI.init();
