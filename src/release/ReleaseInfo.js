export const RELEASE_INFO =
  Object.freeze({
    appName:
      "城市餐饮创业",

    packageName:
      "com.cityrestaurant.mobileui",

    versionName:
      "0.16.2",

    versionCode:
      1602,

    channel:
      "playtest",

    buildType:
      "debug",

    minSdk:
      24,

    compileSdk:
      35,

    targetSdk:
      35
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
