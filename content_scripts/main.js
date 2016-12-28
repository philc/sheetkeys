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

  setMode(mode) {
    if (this.mode === mode) { return; }
    console.log(`Entering ${mode} mode.`);
    this.mode = mode;
    return this.keyQueue = [];
  },

  enterVisualMode() { return this.setMode("visualLine"); },

  // In this mode, entire lines are selected.
  enterVisualLineMode() {
    SheetActions.preserveSelectedColumn();
    SheetActions.selectRow();
    this.setMode("visualLine");
  },

  enterVisualColumnMode() {
    SheetActions.selectColumn();
    this.setMode("visual");
  },

  exitVisualMode() {
    SheetActions.unselectRow();
    this.setMode("normal");
  },

  exitVisualLineMode() {
    SheetActions.unselectRow();
    SheetActions.restoreSelectedColumn();
    this.setMode("normal");
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
          if (this.isEditorEditing()) { return this.setMode("insert"); } else { return this.setMode("normal"); }
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

  init() {
    this.injectPageScript();
    window.addEventListener("focus", (e => this.onFocus(e)), true);
    // When we first focus the spreadsheet, in case we're in fullscreen mode, dismiss the popup message
    // Chrome shows. We have to wait 1s because the DOM is not yet ready to be clicked on.
    addOneTimeListener(window, "focus", () => {
      return setTimeout(() => SheetActions.dismissFullScreenNotificationMessage(), 1000);
    });

    // Key event handlers fire on window before they do on document. Prefer window for key events so the page
    // can't set handlers to grab keys before this extension does.
    window.addEventListener("keydown", (e => this.onKeydown(e)), true);
    this.keyBindingPrefixes = this.buildKeyBindingPrefixes();
  },

  // Returns a map of (partial keyString) => is_bound?
  // Note that the keys only include partial keystrings for bindings. So the binding "dap" will add "d" and
  // "da" keys to this map, but not "dap".
  buildKeyBindingPrefixes() {
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
    const modeBindings = keyBindings[this.mode] || [];
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

      if (fn = modeBindings[keySequence]) {
        this.keyQueue = [];
        this.cancelEvent(e);
        fn();
      }
    }
  },

  typeKey(keyCode, modifiers) {
    if (keyCode == null) {
      console.log("No keyCode provided to typeKey");
      return;
    }
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
  // A bindable function which effectively swallows the keypress it's bound to.
  doNothing() {}
};

// Default keybindings.
// TODO(philc): Make these bindings customizable via preferences.
var keyBindings = {
  "normal": {
    // Cursor movement
    "k": SheetActions.moveUp.bind(SheetActions),
    "j": SheetActions.moveDown.bind(SheetActions),
    "h": SheetActions.moveLeft.bind(SheetActions),
    "l": SheetActions.moveRight.bind(SheetActions),

    // Row & column movement
    "<C-J>": SheetActions.moveRowsDown.bind(SheetActions),
    "<C-K>": SheetActions.moveRowsUp.bind(SheetActions),
    "<C-H>": SheetActions.moveColumnsLeft.bind(SheetActions),
    // TODO(philc): remove this because it's custom to my configuration
    "BACKSPACE": SheetActions.moveColumnsLeft.bind(SheetActions),
    "<C-L>": SheetActions.moveColumnsRight.bind(SheetActions),

    // Editing
    "i": SheetActions.editCell.bind(SheetActions),
    "a": SheetActions.editCellAppend.bind(SheetActions),
    "u": SheetActions.undo.bind(SheetActions),
    "<C-r>": SheetActions.redo.bind(SheetActions),
    "r": UI.replaceChar.bind(UI),
    "o": SheetActions.openRowBelow.bind(SheetActions),
    "O": SheetActions.openRowAbove.bind(SheetActions),
    "s": SheetActions.insertRowBelow.bind(SheetActions),
    "S": SheetActions.insertRowAbove.bind(SheetActions),
    "d,d": UI.deleteRows.bind(UI),
    "x": SheetActions.clear.bind(SheetActions),
    "c,c": SheetActions.changeCell.bind(SheetActions),
    "y,y": SheetActions.copyRow.bind(SheetActions),
    // "Yank cell"
    "y,c": SheetActions.copy.bind(SheetActions),
    "p": SheetActions.paste.bind(SheetActions),

    // Selection
    "v": UI.enterVisualMode.bind(UI),
    "V": UI.enterVisualLineMode.bind(UI),
    "<A-v>": UI.enterVisualColumnMode.bind(UI),

    // Scrolling
    "<C-d>": SheetActions.scrollHalfPageDown.bind(SheetActions),
    "<C-u>": SheetActions.scrollHalfPageUp.bind(SheetActions),
    "g,g": SheetActions.scrollToTop.bind(SheetActions),
    "G": SheetActions.scrollToBottom.bind(SheetActions),

    // Tabs
    ">,>": SheetActions.moveTabRight.bind(SheetActions),
    "<,<": SheetActions.moveTabLeft.bind(SheetActions),
    "g,t": SheetActions.nextTab.bind(SheetActions),
    "g,T": SheetActions.prevTab.bind(SheetActions),
    "J": SheetActions.prevTab.bind(SheetActions),
    "K": SheetActions.nextTab.bind(SheetActions),

    // Formatting
    ";,w,w": SheetActions.wrap.bind(SheetActions),
    ";,w,o": SheetActions.overflow.bind(SheetActions),
    ";,w,c": SheetActions.clip.bind(SheetActions),
    ";,a,l": SheetActions.alignLeft.bind(SheetActions),
    ";,a,c": SheetActions.alignCenter.bind(SheetActions),
    ";,a,r": SheetActions.alignRight.bind(SheetActions),
    ";,c,w": SheetActions.colorCellWhite.bind(SheetActions),
    ";,c,y": SheetActions.colorCellLightYellow3.bind(SheetActions),
    ";,c,b": SheetActions.colorCellLightCornflowerBlue3.bind(SheetActions),
    ";,c,p": SheetActions.colorCellLightPurple.bind(SheetActions),
    ";,c,r": SheetActions.colorCellLightRed3.bind(SheetActions),
    ";,c,g": SheetActions.colorCellLightGray2.bind(SheetActions),
    ";,f,n": SheetActions.setFontSize10.bind(SheetActions), // Font size normal
    ";,f,s": SheetActions.setFontSize8.bind(SheetActions), // Font size small

    // Misc
    ";,w,m": SheetActions.toggleFullScreen.bind(SheetActions), // Mnemonic for "window maximize"
    ";,w,f": SheetActions.toggleFullScreen.bind(SheetActions), // Mnemonic for "window full screen"
    ";,o": SheetActions.openCellAsUrl.bind(SheetActions),
    // For some reason Cmd-r, which normally reloads the page, is disabled by sheets.
    "<M-r>": UI.reloadPage.bind(UI),
    // Don't pass through ESC to the page in normal mode. If you hit ESC in normal mode, nothing should
    // happen. If you mistakenly type it in Sheets, you will exit full screen mode.
    "esc": UI.doNothing
  },

  "insert": {
    // In normal Sheets, esc takes you out of the cell and loses your edits. That's a poor experience for
    // people used to Vim. Now ESC will save your cell edits and put you back in normal mode.
    "esc": SheetActions.commitCellChanges.bind(SheetActions),
    // In form fields on Mac, C-e takes you to the end of the field. For some reason C-e doesn't work in
    // Sheets. Here, we fix that.
    "<C-e>": SheetActions.moveCursorToCellLineEnd.bind(SheetActions),
    "<M-r>": UI.reloadPage.bind(UI)
  }
};

keyBindings.visual = extend(clone(keyBindings.normal), {
  "j": SheetActions.moveDownAndSelect.bind(SheetActions),
  "k": SheetActions.moveUpAndSelect.bind(SheetActions),
  "h": SheetActions.moveLeftAndSelect.bind(SheetActions),
  "l": SheetActions.moveRightAndSelect.bind(SheetActions),
  "y": SheetActions.copy.bind(SheetActions),
  "y,y": null, // Unbind "copy row", because it's superceded by "copy"
  "esc": UI.exitVisualMode.bind(UI)
});

keyBindings.visualLine = extend(clone(keyBindings.visual),
  {"esc": UI.exitVisualLineMode.bind(UI)});

UI.init();
