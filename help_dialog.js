// TODO(philc): Consider making Mapping a struct.
class HelpDialog {

  // Returns a map of groupName => [Mapping]
  async getMappingsByGroup() {
    const mappings = await Settings.loadUserKeyMappings();
    console.log(">>>> settings mappings:", mappings);
    window.o = mappings;
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
    const response = await fetch(chrome.runtime.getURL("help_dialog.html"));
    let html = await response.text();
    html = html.replace("help_dialog.css", chrome.runtime.getURL("help_dialog.css"));
    const helpDialog = document.createElement("div");
    // let shadow = helpDialog;
    const shadow = helpDialog.attachShadow({ mode: "open" });
    shadow.innerHTML = html;
    document.body.appendChild(helpDialog);
    return helpDialog;
  }

  async populateDialog() {
    const mappings = await this.getMappingsByGroup();
    const groups = ["movement", "selection", "editing", "formatting", "other"];
    const capitalize = function(str) {
      const lower = str.toLowerCase();
      return str.charAt(0).toUpperCase() + lower.slice(1);
    }

    const shadow = this.el.shadowRoot;
    console.log(this.el.shadowRoot);
    console.log(this.el);

    const theadTemplate = shadow.querySelector("thead");
    console.log(">>>> theadTemplate:", theadTemplate);
    const tbodyTemplate = shadow.querySelector("tbody");
    console.log(">>>> tbodyTemplate:", tbodyTemplate);
    const trTemplate = tbodyTemplate.querySelector("tr");

    const table = shadow.querySelector("table");
    table.innerHTML = "";
    for (let group of groups) {
      const thead = theadTemplate.cloneNode(true);
      console.log(">>>> thead:", thead);
      thead.querySelector("td").innerText = capitalize(group);

      const mappingsForGroup = mappings[group];
      console.log(">>>> mappingsForGroup:", group, mappingsForGroup);
      const tbody = tbodyTemplate.cloneNode();
      // tbody.innerHTML = "";
      for (let mapping of mappingsForGroup) {
        // TODO(philc): Skipping everything outside of normal mode.
        if (mapping.mode != "normal")
          continue;
        const row = trTemplate.cloneNode(true);
        const cells = row.querySelectorAll("td");
        const command = Commands.commands[mapping.command];
        console.log(">>>> mapping.command:", mapping.command);
        cells[0].innerText = command.name || mapping.command;
        cells[1].innerText = mapping.key;
        tbody.appendChild(row);
      }
      table.appendChild(thead);
      table.appendChild(tbody);
    }
  }

  async show() {
    if (!this.el)
      // Is it OK this is blocking?
      this.el = await this.createElement();
    await this.populateDialog();
    this.el.style.display = "";
  }
}
