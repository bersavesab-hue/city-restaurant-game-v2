export const RELEASE_INFO =
  Object.freeze({
    appName:
      "城市餐饮创业",

    packageName:
      "com.cityrestaurant.v2playtest",

    versionName:
      "0.8.65",

    versionCode:
      865,

    channel:
      "playtest",

    buildType:
      "debug",

    minSdk:
      23,

    targetSdk:
      34
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
