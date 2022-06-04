class HelpDialog {

  async getHtml() {
    const mappingsByGroup = await this.getMappingsByGroup();
    console.log(">>>> mappingsByGroup:", mappingsByGroup);

    const groups = ["movement", "other"];
    for (let group of groups) {
      console.log("group:", group);
      for (let mapping of mappingsByGroup[group])
        console.log(mapping.key, mapping.command);
    }

  }

  async getMappingsByGroup() {

    const mappings = await Settings.loadUserKeyMappings();
    window.o = mappings;
    const groupsToCommand = { "movement": [], "other": [] };

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
}
