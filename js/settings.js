var defaultSettings = {
    play_sound: false,
    theme: "default"
};

function readSettingsFromLocalStorage() {
  if (localStorage.getItem("settings")) {
    var settings = _.extend(defaultSettings, JSON.parse(localStorage.getItem("settings")));
    if (settings.theme !== "flat1" && settings.theme !== "default") {
      settings.theme = "default";
    }
    return settings;
  }
  return defaultSettings;
}
