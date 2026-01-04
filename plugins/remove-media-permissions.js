const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");

const PERMS_TO_REMOVE = [
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  // Often also pulled in by libs / older flows:
  "android.permission.READ_EXTERNAL_STORAGE",
];

module.exports = function withRemoveMediaPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest) return config;

    // Ensure tools namespace exists so tools:node works
    manifest.$ = manifest.$ || {};
    manifest.$["xmlns:tools"] = manifest.$["xmlns:tools"] || "http://schemas.android.com/tools";

    // Ensure uses-permission array exists
    manifest["uses-permission"] = manifest["uses-permission"] || [];

    // 1) Remove any existing entries in app manifest (nice-to-have)
    manifest["uses-permission"] = manifest["uses-permission"].filter((p) => {
      const name = p?.$?.["android:name"];
      return !PERMS_TO_REMOVE.includes(name);
    });

    // 2) Add explicit "remove" directives to override library manifests
    for (const name of PERMS_TO_REMOVE) {
      manifest["uses-permission"].push({
        $: {
          "android:name": name,
          "tools:node": "remove",
        },
      });
    }

    // Also handle common alternative permission arrays if present
    const keys = ["uses-permission-sdk-23", "uses-permission-sdk-m", "uses-permission-sdk-33"];
    for (const k of keys) {
      if (manifest[k]) {
        manifest[k] = manifest[k].filter((p) => !PERMS_TO_REMOVE.includes(p?.$?.["android:name"]));
      }
    }

    return config;
  });
};
