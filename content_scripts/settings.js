Settings = {
  // Returns a nested map of mode => key => commandName.
  parse(configText) {
    var lines = configText.trim().split("\n");
    var keyBindings = {};
    for (let line of lines) {
      line = line.trim();
      if (line == "") { continue; } // Ignore blank lines.
      const [mapCommand, key, commandName] = line.split(/\s+/);
      // TODO(philc): return validation errors.
      if (!keyBindings["normal"]) { keyBindings["normal"] = {} ; }
      keyBindings["normal"][key] = commandName;
    }
    return keyBindings;
  },

  // Reads the user's keybindings out of Chrome storage.
  getKeybindings() {
    var value = "";
    return parse("");
  }

};
