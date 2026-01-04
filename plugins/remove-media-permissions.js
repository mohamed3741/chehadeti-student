// Config plugin to remove READ_MEDIA_IMAGES and READ_MEDIA_VIDEO permissions
const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

const MEDIA_PERMISSIONS_TO_REMOVE = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
];

module.exports = function withRemoveMediaPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest) {
      return config;
    }

    // Remove permissions from uses-permission array
    if (manifest['uses-permission']) {
      manifest['uses-permission'] = manifest['uses-permission'].filter((permission) => {
        const permissionName = permission.$?.['android:name'];
        return !MEDIA_PERMISSIONS_TO_REMOVE.includes(permissionName);
      });
    }

    // Also remove from permissions array if it exists
    if (manifest.permission) {
      manifest.permission = manifest.permission.filter((permission) => {
        const permissionName = permission.$?.['android:name'];
        return !MEDIA_PERMISSIONS_TO_REMOVE.includes(permissionName);
      });
    }

    return config;
  });
};

