Settings = {
  settingsKey: "settings-v1",

  // Returns a nested map of mode => commandName => key
  parseKeyMappings(keyMappings) {
    return { "normal": keyMappings };
    // var lines = configText.trim().split("\n");
    // var keyMappings = {};
    // for (let line of lines) {
    //   line = line.trim();
    //   if (line == "") { continue; } // Ignore blank lines.
    //   const [mapCommand, key, commandName] = line.split(/\s+/);

    //   // TODO(philc): Support keybindings in modes other than normal.
    //   // TODO(philc): return validation errors.
    //   if (!keyMappings["normal"]) { keyMappings["normal"] = {} ; }
    //   keyMappings["normal"][key] = commandName;
    // }
    // return keyMappings;
  },

  async get() {
    const settings = await chrome.storage.sync.get(this.settingsKey);
    const defaultOptions = {
      keyMappings: {} // A map of commandName => list of keys
    };
    return Object.assign(defaultOptions, settings[this.settingsKey]);
  },

  async set(settings) {
    const o = {};
    o[this.settingsKey] = settings;
    chrome.storage.sync.set(o);
  },

  async changeKeyMapping(commandName, keyMapping) {
    if (commandName == null || keyMapping == null || keyMapping == "") {
      throw new Error(`Invalid command name or key mapping '${commandName}', '${keyMapping}'`);
    }
    const settings = await Settings.get();
    settings.keyMappings[commandName] = keyMapping;
    await Settings.set(settings);
  },

  async loadUserKeyMappings() {
    const settings = await Settings.get();
    console.log(">>>> settings:", settings);
    let userMappings = this.parseKeyMappings(settings.keyMappings);
    let mappings = {};
    // Perform a deep merge with the default key mappings.
    for (let mode in Commands.defaultMappings) {
      mappings[mode] = Object.assign({}, Commands.defaultMappings[mode]);
      Object.assign(mappings[mode], userMappings[mode]);
    }
    console.log(">>>> mappings:", mappings);
    return mappings;
  }

};
