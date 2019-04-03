var Settings = require("sketch/settings");

var kUUIDKey = "google.analytics.uuid";
var uuid = Settings.globalSettingForKey(kUUIDKey);
if (!uuid) {
  uuid = NSUUID.UUID().UUIDString();
  Settings.setGlobalSettingForKey(uuid, kUUIDKey);
}

var variant = MSApplicationMetadata.metadata().variant;
var source =
  "Sketch " +
  (variant == "NONAPPSTORE" ? "" : variant + " ") +
  Settings.version.sketch;

function jsonToQueryString(json) {
  return Object.keys(json)
    .map(function(key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
    })
    .join("&");
}

module.exports = function(trackingId, hitType, props) {
  if (!Settings.globalSettingForKey("analyticsEnabled")) {
    // the user didn't enable sharing analytics
    return;
  }

  var payload = {
    v: 1,
    tid: trackingId,
    ds: source,
    cid: uuid,
    t: hitType
  };

  if (typeof __command !== "undefined") {
    payload.an = __command.pluginBundle().name();
    payload.aid = __command.pluginBundle().identifier();
    payload.av = __command.pluginBundle().version();
  }

  if (props) {
    Object.keys(props).forEach(function(key) {
      payload[key] = props[key];
    });
  }

  var url = NSURL.URLWithString(
    "https://www.google-analytics.com/collect?" +
      jsonToQueryString(payload) +
      "&z=" +
      NSUUID.UUID().UUIDString()
  );

  if (url) {
    NSURLSession.sharedSession()
      .dataTaskWithURL(url)
      .resume();
  }
};
