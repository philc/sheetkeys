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
      for (let [key, commandName] of Object.entries(mappings[mode])) {
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

  async createElement() {
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
    this.el.addEventListener("focus", (e) => this.onFocus(e));
    this.el.addEventListener("click", async (e) => await this.onClick(e));
  }

  async onClick(event) {
    const target = event.path[0];
    console.log("On click", target);
    if (target.classList.contains("cancel")) {
      // TODO(philc): cancel
    } else if (target.classList.contains("save")) {
      await this.commitChange();
    } else if (target.classList.contains("reset")) {
      // TODO(philc): reset
    }
  }

  onFocus(event) {
    this.activeShortcutEl = event.path[0];
    // TODO(philc): Implement "cancel".
    this.activeShortcutEl.innerHTML = "";
    this.el.addEventListener("keydown", this.keydownListener);
    this.keyStrings = [];
    const tr = this.activeShortcutEl.closest("tr");
    tr.querySelector(".cancel").style.display = "inline";
    tr.querySelector(".save").style.display = "inline";
    tr.querySelector(".reset").style.display = "none";
  }

  async commitChange() {
    console.log("commit change");
    this.el.removeEventListener("keydown", this.keydownListener);

    const tr = this.activeShortcutEl.closest("tr");
    tr.querySelector(".cancel").style.display = null;
    tr.querySelector(".save").style.display = null;
    tr.querySelector(".reset").style.display = null;

    const newKeyMapping = this.keyStrings.join(Commands.KEY_SEPARATOR);
    const commandName = tr.dataset.command;
    console.log(">>>> commandName:", commandName);
    console.log(">>>> newKeyMapping:", newKeyMapping);
    await Settings.changeKeyMapping(commandName, newKeyMapping);

    this.activeShortcutEl = null;
    this.keyStrings = null;
  }

  onKeydown(event) {
    console.log("help dialog on keydown", event);
    event.preventDefault();
    event.stopPropagation();

    const keyString = KeyboardUtils.getKeyString(event);

    // Ignore key presses which are just modifiers.
    if (!keyString)
      return;

    // const sk = new ShortcutKey(event.key, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey,
    //                            event.metaKey);
    this.keyStrings.push(keyString);
    this.activeShortcutEl.appendChild(this.createSpan(keyString));
  }

  createSpan(keyString) {
    const s = document.createElement("span");
    s.innerText = keyString;
    return s;
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
        // TODO(philc): Skipping everything outside of normal mode.
        if (mapping.mode != "normal")
          continue;
        const row = trTemplate.cloneNode(true);
        row.dataset.command = mapping.command;
        const cells = row.querySelectorAll("td");
        const command = Commands.commands[mapping.command];
        const shortcutDiv = row.querySelector("div.shortcut");
        cells[0].innerText = command.name || mapping.command;
        shortcutDiv.innerText = mapping.key;
        tbody.appendChild(row);
      }
      table.appendChild(thead);
      table.appendChild(tbody);
    }
  }

  async show() {
    await this.createElement();
    await this.populateDialog();
    this.el.style.display = "";
  }
}
