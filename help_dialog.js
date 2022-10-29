class ShortcutKey {
  constructor(key, keyCode, shift, ctrl, alt, meta) {
    this.key = key;
    this.keyCode = keyCode;
    this.shiftKey = shift;
    this.ctrlKey = ctrl;
    this.altKey = alt;
    this.metaKey = meta;
  }
}

class HelpDialog {
  constructor() {
    // State for when a key mapping is being edited.
    this.edits = {
      keyStrings: [],
      rowEl: null,
    };
  }

  // Returns a map of groupName => [commandKey]
  getCommandsByGroup() {
    const groupsToCommand = {
      "movement": [],
      "editing": [],
      "selection": [],
      "tabs": [],
      "formatting": [],
      "other": []
    };

    for (let [key, command] of Object.entries(Commands.commands))
      groupsToCommand[command.group].push(key);
    return groupsToCommand;
  }

  async createDialogElement() {
    if (this.el)
      return;

    // Here, we're adding a CSS file to the document root (outside of the dialog's shadow DOM) which contains
    // a font-face declaration for an icon font. This is required if we want to use the font within the shadow
    // DOM. It's a long-standing bug in Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=336876
    // Workaround described: https://github.com/google/material-design-icons/issues/1165#issuecomment-851128010
    const linkEl = document.createElement("link");
    linkEl.setAttribute("type", "text/css");
    linkEl.setAttribute("rel", "stylesheet");
    linkEl.setAttribute("href", chrome.runtime.getURL("fontello_svg_icon_font.css"));
    document.head.appendChild(linkEl);

    const response = await fetch(chrome.runtime.getURL("help_dialog.html"));
    let html = await response.text();
    html = html.replace('href="help_dialog.css"', `href="${chrome.runtime.getURL("help_dialog.css")}"`);
    const helpDialog = document.createElement("div");
    // let shadow = helpDialog;
    const shadow = helpDialog.attachShadow({ mode: "open" });
    shadow.innerHTML = html;
    document.body.appendChild(helpDialog);
    this.el = helpDialog;
    this.keydownListener = (e) => this.onKeydown(e);
    this.el.addEventListener("click", async (e) => await this.onClick(e));
  }

  async onClick(event) {
    const anchor = event.path[0].closest("a");
    if (!anchor)
      return;
    event.preventDefault();
    if (anchor.classList.contains("close")) {
      this.hide();
    } else if (anchor.classList.contains("edit")) {
      this.beginEditing(anchor);
    } else if (anchor.classList.contains("save")) {
      this.commitChange();
    } else if (anchor.classList.contains("cancel")) {
      this.cancelEditing();
    } else if (anchor.classList.contains("default")) {
      this.resetToDefault();
    }
  }

  beginEditing(clickTarget) {
    if (this.edits.rowEl) {
      // Another mapping was being edited. Cancel that, so that we have only one edit in progress at a time.
      this.cancelEditing();
    }
    const tr = clickTarget.closest("tr");
    this.showEditingUI(tr, true);
    // Remove the UI elements which shows the existing key binding.
    const shortcutEl = this.edits.rowEl.querySelector(".shortcut");
    shortcutEl.classList.add("editing");
    shortcutEl.focus();
    shortcutEl.innerHTML = "";
    this.el.addEventListener("keydown", this.keydownListener);
  }

  // Shows/hides the editing UI, and sets the local state of `edits` accordingly.
  showEditingUI(tr, visibility) {
    tr.querySelector(".editing-controls").style.visibility = visibility ? "visible" : "hidden";
    tr.querySelector(".edit").style.visibility = visibility ? "hidden" : "visible";
    this.edits.keyStrings = [];
    this.edits.rowEl = visibility ? tr : null;
  }

  // Creates HTML within shortcutEl to display the given key mapping.
  displayKeyString(shortcutEl, keyMapping) {
    shortcutEl.innerHTML = "";
    if (keyMapping) {
      for (const keyString of keyMapping.split(Commands.KEY_SEPARATOR)) {
        const s = document.createElement("span");
        s.innerText = keyString;
        shortcutEl.appendChild(s);
      }
    }
  }

  cancelEditing() {
    const shortcutEl = this.edits.rowEl.querySelector(".shortcut");
    shortcutEl.classList.remove("editing");
    shortcutEl.innerHTML = "";
    let originalMapping = this.edits.rowEl.dataset.mapping;
    if (originalMapping == "")
      originalMapping = null;
    this.displayKeyString(shortcutEl, originalMapping);
    this.showEditingUI(this.edits.rowEl, false);
  }

  // Restores the command currently being mapped to its SheetKeys default mapping.
  resetToDefault() {
    const command = this.edits.rowEl.dataset.command;
    const defaultMapping = Commands.defaultMappings.normal[command];
    this.edits.keyStrings = defaultMapping ? defaultMapping.split(Commands.KEY_SEPARATOR) : [];
    this.displayKeyString(this.edits.rowEl.querySelector(".shortcut"), defaultMapping);
    this.commitChange();
  }

  async commitChange() {
    const newKeyMapping = this.edits.keyStrings.length > 0 ?
          this.edits.keyStrings.join(Commands.KEY_SEPARATOR) :
          null;
    const commandName = this.edits.rowEl.dataset.command;
    await Settings.changeKeyMapping(commandName, newKeyMapping);
    this.edits.rowEl.dataset.mapping = newKeyMapping || "";
    this.el.removeEventListener("keydown", this.keydownListener);
    this.showEditingUI(this.edits.rowEl, false);
  }

  onKeydown(event) {
    console.log("help dialog on keydown", event);
    event.preventDefault();
    event.stopPropagation();

    const keyString = KeyboardUtils.getKeyString(event);

    // Ignore key presses which are just modifiers.
    if (!keyString)
      return;

    this.edits.keyStrings.push(keyString);
    this.displayKeyString(this.edits.rowEl.querySelector(".shortcut"),
                          this.edits.keyStrings.join(Commands.KEY_SEPARATOR));
  }

  async populateDialog() {
    const commandsByGroup = this.getCommandsByGroup();

    // These are the order in which they'll be shown in the dialog.
    const groups = ["movement", "selection", "editing", "formatting", "other"];

    const capitalize = function(str) {
      const lower = str.toLowerCase();
      return str.charAt(0).toUpperCase() + lower.slice(1);
    }

    const shadow = this.el.shadowRoot;
    const theadTemplate = shadow.querySelector("thead");
    const tbodyTemplate = shadow.querySelector("tbody");
    const trTemplate = tbodyTemplate.querySelector("tr");

    const table = shadow.querySelector("table");
    table.innerHTML = "";

    // Only show bindings, and only allow customization, for normal mode.
    const normalModeMappings = (await Settings.loadUserKeyMappings()).normal;

    for (let group of groups) {
      const thead = theadTemplate.cloneNode(true);
      thead.querySelector("td").innerText = capitalize(group);

      const commandKeys = commandsByGroup[group];

      const tbody = tbodyTemplate.cloneNode();

      for (let commandKey of commandKeys) {
        const row = trTemplate.cloneNode(true);
        const mapping = normalModeMappings[commandKey]; // This can be null.
        row.dataset.command = commandKey;
        row.dataset.mapping = mapping || "";
        const command = Commands.commands[commandKey];
        row.querySelector(".display-name").innerText = command.name || commandKey;
        const shortcutEl = row.querySelector(".shortcut");
        this.displayKeyString(shortcutEl, mapping);
        tbody.appendChild(row);
      }
      table.appendChild(thead);
      table.appendChild(tbody);
    }
  }

  async show() {
    await this.createDialogElement();
    await this.populateDialog();
    this.el.style.display = "";
  }

  hide() {
    this.el.style.display = "none";
  }
}
