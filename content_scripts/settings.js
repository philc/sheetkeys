Settings = {
  settingsKey: "settings-v1",

  async get() {
    // TODO(philc): This settings key doesn't need to be version-specific at the chrome.storage.sync level.
    // I think we want to have one key for chrome.storage.sync (e.g. "sheetkeys"), and within that map,
    // keys for settings versions, so we can migrate settings from old versions of sheetkeys to new versions,
    // whenever the settings change in a way that is not backwards compatible.
    const settings = await chrome.storage.sync.get(this.settingsKey);
    const defaultOptions = {
      keyMappings: {} // A map of commandName => list of keys
    };

    const values = settings[this.settingsKey];

    // If the user has a keybinding which refers to a command that no longer exists, prune it.
    for (let commandName of Object.keys(values.keyMappings || {})) {
      if (!Commands.commands[commandName])
        delete values.keyMappings[mode][commandName];
    }

    return Object.assign(defaultOptions, values);
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
    // We only allow the user to bind keys in normal mode, for simplicity.
    const mappings = Object.assign({}, Commands.defaultMappings);
    mappings.normal = Object.assign(mappings.normal, settings.keyMappings);
    return mappings;
  }

};
