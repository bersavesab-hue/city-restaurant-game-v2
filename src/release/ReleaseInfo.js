export const RELEASE_INFO =
  Object.freeze({
    appName:
      "城市餐饮创业",

    packageName:
      "com.cityrestaurant.v2playtest",

    versionName:
      "0.8.73",

    versionCode:
      873,

    channel:
      "playtest",

    buildType:
      "debug",

    minSdk:
      23,

    compileSdk:
      36,

    targetSdk:
      36
  });


export function getReleaseLabel() {
  return (
    RELEASE_INFO.appName +
    " v" +
    RELEASE_INFO.versionName +
    " (" +
    RELEASE_INFO.versionCode +
    ")"
  );
}
