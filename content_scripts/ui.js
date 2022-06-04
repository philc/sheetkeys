// Utilities

const clone = o => Object.assign({}, o);

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
  maxKeyMappingLength: 3,
  // Mode can be one of:
  // * normal
  // * insert: when editing a cell's contents
  // * disabled: when the cursor is on some other form field in Sheets, like the Find dialog.
  // * replace: when "r" has been typed, and we're waiting for the user to type a character to replace the
  //   cell's contents with.
  mode: "normal",
  // Keys which were typed recently
  keyQueue: [],
  // A map of mode -> comma-separated keys -> bool. The keys are prefixes to the user's bound key mappings.
  keyMappingsPrefixes: null,
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

    setTimeout(async () => {
      const mappings = await this.loadUserKeyMappings();
      this.keyMappings = mappings;
      this.keyMappingsPrefixes = this.buildKeyMappingsPrefixes(mappings);
    }, 0);
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
      SheetActions.unselectRow();
      SheetActions.restoreSelectedColumn();
      this.setMode("normal");
      break;
    case "visualColumn":
      SheetActions.unselectRow();
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
    script.src = chrome.runtime.getURL("page_scripts/page_script.js");
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
    var style = this.editor.parentNode.getAttribute("style");
    return style != null && style != "";
  },

  async loadUserKeyMappings() {
    const settings = await Settings.get();
    let userMappings = settings.keyMappings ? Settings.parseKeyMappings(settings.keyMappings) : {};
    console.log(">>>> userMappings:", userMappings);
    let mappings = {};
    // Perform a deep merge with the default key mappings.
    for (let mode in Commands.defaultMappings) {
      mappings[mode] = clone(Commands.defaultMappings[mode]);
      Object.assign(mappings[mode], userMappings[mode]);
    }
    return mappings;
  },

  // Returns a map of (partial keyString) => is_bound?
  // Note that the keys only include partial keystrings for mappings. So the mapping "dap" will add "d" and
  // "da" keys to this map, but not "dap".
  buildKeyMappingsPrefixes(keyMappings) {
    const prefixes = {};
    for (let mode in keyMappings) {
      prefixes[mode] = {};
      const modeKeyMappings = keyMappings[mode];
      for (let keyString in modeKeyMappings) {
        // If the bound action is null, then treat this key as unbound.
        const action = modeKeyMappings[keyString];
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
    if (this.keyQueue.length > this.maxKeyMappingLength) { this.keyQueue.shift(); }
    const modeMappings = this.keyMappings[this.mode] || [];
    const modePrefixes = this.keyMappingsPrefixes[this.mode] || [];
    // See if a bound command matches the typed key sequence. If so, execute it.
    // Prioritize longer mappings over shorter mappings.
    for (let i = Math.min(this.maxKeyMappingLength, this.keyQueue.length); i >= 1; i--) {
      var fn;
      const keySequence = this.keyQueue.slice(this.keyQueue.length - i, this.keyQueue.length).join(",");
      // If this key could be part of one of the bound key mapping, don't pass it through to the page.
      // Also, if some longer mapping partically matches this key sequence, then wait for more keys, and
      // don't immediately apply a shorter mapping which also matches this key sequence.
      if (modePrefixes[keySequence]) {
        this.cancelEvent(e);
        return;
      }

      if (commandName = modeMappings[keySequence]) {
        this.keyQueue = [];
        this.cancelEvent(e);
        Commands.commands[commandName].fn();
      }
    }
  },

  // modifiers: optiona; an object with these boolean properties: meta, shift, control.
  typeKey(keyCode, modifiers) {
    if (keyCode == null) { throw "The keyCode provided to typeKey() is null."; }
    this.ignoreKeys = true;
    if (!modifiers) { modifiers = {}; }
    document.getElementById("sheetkeys-json-message").innerText =
      JSON.stringify({keyCode, mods: modifiers});
    window.dispatchEvent(new CustomEvent("sheetkeys-simulate-key-event", {}));
    this.ignoreKeys = false;
  },

  deleteRowsOrColumns() {
    SheetActions.deleteRowsOrColumns();
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
