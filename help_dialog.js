// TODO(philc): Consider making Mapping a struct.

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

  // Returns a map of groupName => [Mapping]
  async getMappingsByGroup() {
    const mappings = await Settings.loadUserKeyMappings();
    const groupsToCommand = { "movement": [],
                              "editing": [],
                              "selection": [],
                              "tabs": [],
                              "formatting": [],
                              "other": [] };

    // TODO(philc): This logic needs to account for commands which are not bound to keys...
    const commandToGroup = {};
    for (let [key, command] of Object.entries(Commands.commands))
      commandToGroup[key] = command.group || "other";

    for (let mode of Object.keys(mappings)) {
      for (let [commandName, key] of Object.entries(mappings[mode])) {
        const group = commandToGroup[commandName];
        if (!group) {
          // There must be an invalid key mapping in the command.
          continue;
        }
        groupsToCommand[group].push({mode: mode, key: key, command: commandName});
      }
    }
    return groupsToCommand;
  }

  async createDialogElement() {
    if (this.el)
      return;
    const response = await fetch(chrome.runtime.getURL("help_dialog.html"));
    let html = await response.text();
    html = html.replace("help_dialog.css", chrome.runtime.getURL("help_dialog.css"));
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
    const target = event.path[0];
    if (target.classList.contains("edit")) {
      this.beginEditing(target);
    } else if (target.classList.contains("save")) {
      this.commitChange();
    } else if (target.classList.contains("cancel")) {
      this.cancelEditing();
    } else if (target.classList.contains("default")) {
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
    shortcutEl.focus();
    shortcutEl.innerHTML = "";
    this.el.addEventListener("keydown", this.keydownListener);
  }

  // Shows/hides the editing UI, and sets the local state of `edits` accordingly.
  showEditingUI(tr, visibility) {
    tr.querySelector(".editing-controls").style.display = visibility ? "inline" : "none";
    tr.querySelector(".edit").style.display = visibility ? "none" : "inline";
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
    shortcutEl.innerHTML = "";
    const originalMapping = this.edits.rowEl.dataset.mapping;
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
    this.edits.rowEl.dataset.mapping = newKeyMapping;
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
    const mappings = await this.getMappingsByGroup();
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
    for (let group of groups) {
      const thead = theadTemplate.cloneNode(true);
      thead.querySelector("td").innerText = capitalize(group);

      const mappingsForGroup = mappings[group];
      const tbody = tbodyTemplate.cloneNode();
      for (let mapping of mappingsForGroup) {
        // Only show bindings, and only allow customization, for normal mode.
        if (mapping.mode != "normal")
          continue;
        const row = trTemplate.cloneNode(true);
        row.dataset.command = mapping.command;
        row.dataset.mapping = mapping.key;
        const cells = row.querySelectorAll("td");
        const command = Commands.commands[mapping.command];
        const shortcutEl = row.querySelector(".shortcut");
        cells[0].innerText = command.name || mapping.command;
        this.displayKeyString(shortcutEl, mapping.key);
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
}
