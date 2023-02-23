const Settings = {
  settingsKey: "settings-v1",

  async get() {
    // NOTE(philc): If we change the schema of the settings object in a backwards-incompatible way,
    // then we can fetch the whole storage object here and migrate any old settings the user has to
    // the new schema.
    const settings = await chrome.storage.sync.get(this.settingsKey);
    const defaultOptions = {
      keyMappings: {}, // A map of commandName => list of keys
    };

    const values = settings[this.settingsKey] || {};

    // If the user has a keybinding which refers to a command that no longer exists, prune it.
    for (const commandName of Object.keys(values.keyMappings || {})) {
      if (!Commands.commands[commandName]) {
        delete values.keyMappings[mode][commandName];
      }
    }

    return Object.assign(defaultOptions, values);
  },

  set(settings) {
    const o = {};
    o[this.settingsKey] = settings;
    chrome.storage.sync.set(o);
  },

  // Saves the new mapping in Settings, and broadcasts a message to the SheetKeys content scripts in
  // all tabs that a key mapping has changed.
  async changeKeyMapping(commandName, keyMapping) {
    if (commandName == null || keyMapping == "") {
      throw new Error(`Invalid command name or key mapping '${commandName}', '${keyMapping}'`);
    }
    const settings = await Settings.get();
    settings.keyMappings[commandName] = keyMapping;
    Settings.set(settings);
    chrome.runtime.sendMessage(null, "keyMappingChange");
  },

  // Returns a map of { mode => { commandName => keyString } }
  async loadUserKeyMappings() {
    const settings = await Settings.get();
    const mappings = {};
    // Do a deep clone of the default mappings.
    for (const mode of Object.keys(Commands.defaultMappings)) {
      mappings[mode] = Object.assign({}, Commands.defaultMappings[mode]);
    }
    // We only allow the user to bind keys in normal mode, for conceptual and UI simplicity.
    mappings.normal = Object.assign(mappings.normal, settings.keyMappings);
    return mappings;
  },
};
