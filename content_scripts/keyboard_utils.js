// The names of these keys are exposed in the UI if the user types one of these when creating a
// mapping.
const keyCodes = {
  backspace: 8,
  tab: 9,
  ctrlEnter: 10,
  enter: 13,
  esc: 27,
  space: 32,
  pageUp: 33,
  pageDown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  "delete": 46,
  f1: 112,
  f12: 123,
};

globalThis.KeyboardUtils = {
  keyCodes: keyCodes,

  // A map of keyCode => keyName (a reverse map of keyCodes).
  keyNames: new Map(Object.entries(keyCodes).map(([k, v]) => [v, k])),

  // Returns the string "<A-f>" if "alt F" is pressed.
  getKeyString(event) {
    let keyString;
    if (this.keyNames.has(event.keyCode)) {
      keyString = this.keyNames.get(event.keyCode);
    } else if (event.altKey && event.key && event.key != "Alt") {
      // The pressed key is a non-ASCII printing character in the current layout, and is ASCII in
      // en_US, so we use the corresponding ASCII character. We do this because event.key when
      // modified with Alt may represent a character other than the key in the user's keyboard
      // layout. E.g. on Mac, <A-v> comes through as <A-√>. See
      // https://github.com/philc/vimium/issues/2147#issuecomment-230370011 for discussion.
      keyString = String.fromCharCode(event.keyCode).toLowerCase();
    } else if (event.key.length === 1) {
      keyString = event.key;
    } else if (event.key.length === 2 && "F1" <= event.key && event.key <= "F9") {
      keyString = event.key.toLowerCase(); // F1 to F9.
    } else if (event.key.length === 3 && "F10" <= event.key && event.key <= "F12") {
      keyString = event.key.toLowerCase(); // F10 to F12.
    } else {
      // Ignore modifiers by themselves.
      return;
    }

    const modifiers = [];

    if (event.shiftKey) {
      keyString = keyString.toUpperCase();
    }
    if (event.metaKey) {
      modifiers.push("M");
    }
    if (event.ctrlKey) {
      modifiers.push("C");
    }
    if (event.altKey) {
      modifiers.push("A");
    }

    for (const mod of Array.from(modifiers)) {
      keyString = mod + "-" + keyString;
    }

    if (modifiers.length > 0) {
      keyString = `<${keyString}>`;
    }
    return keyString;
  },

  createSimulatedKeyEvent(type, keyCode, keyIdentifier) {
    // How to do this in Chrome: http://stackoverflow.com/q/10455626/46237
    const event = document.createEvent("KeyboardEvent");
    Object.defineProperty(event, "keyCode", {
      get() {
        return this.keyCodeVal;
      },
    });
    Object.defineProperty(event, "which", {
      get() {
        return this.keyCodeVal;
      },
    });
    Object.defineProperty(event, "keyIdentifier", {
      get() {
        return keyIdentifier;
      },
    });
    event.initKeyboardEvent(
      type,
      true,
      true,
      document.defaultView,
      false,
      false,
      false,
      false,
      keyCode,
      0,
    );
    event.keyCodeVal = keyCode;
    event.keyIdentifier = keyIdentifier;
    return event;
  },

  simulateKeypress(el, keyCode, keyIdentifier) {
    el.dispatchEvent(this.createSimulatedKeyEvent("keydown", keyCode, keyIdentifier));
    el.dispatchEvent(this.createSimulatedKeyEvent("keypress", keyCode, keyIdentifier));
    el.dispatchEvent(this.createSimulatedKeyEvent("keyup", keyCode, keyIdentifier));
  },

  simulateClick(el, x, y) {
    if (x == null) x = 0;
    if (y == null) y = 0;
    const eventSequence = ["mouseover", "mousedown", "mouseup", "click"];
    for (const eventName of eventSequence) {
      const event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        eventName,
        true, // bubbles
        true, // cancelable
        window, //view
        1, // event-detail
        x, // screenX
        y, // screenY
        x, // clientX
        y, // clientY
        false, // ctrl
        false, // alt
        false, // shift
        false, // meta
        0, // button
        null, // relatedTarget
      );
      el.dispatchEvent(event);
    }
  },
};
