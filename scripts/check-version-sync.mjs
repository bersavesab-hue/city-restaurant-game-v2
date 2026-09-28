import fs from "node:fs";
import path from "node:path";

import {
  RELEASE_INFO
} from "../src/release/ReleaseInfo.js";

const root =
  path.resolve(
    import.meta.dirname,
    ".."
  );

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(
      path.join(root, file),
      "utf8"
    )
  );
}

const packageJson =
  readJson(
    "package.json"
  );

const packageLock =
  readJson(
    "package-lock.json"
  );

const gradle =
  fs.readFileSync(
    path.join(
      root,
      "mobile/android/app/build.gradle"
    ),
    "utf8"
  );

const errors = [];

function matchGradle(
  pattern,
  label
) {
  const match =
    gradle.match(
      pattern
    );

  if (!match) {
    errors.push(
      `Android Gradle missing ${label}`
    );

    return null;
  }

  return match[1];
}

const android = {
  packageName:
    matchGradle(
      /applicationId\s+"([^"]+)"/,
      "applicationId"
    ),
  versionName:
    matchGradle(
      /versionName\s+"([^"]+)"/,
      "versionName"
    ),
  versionCode:
    Number(
      matchGradle(
        /versionCode\s+(\d+)/,
        "versionCode"
      )
    ),
  minSdk:
    Number(
      matchGradle(
        /minSdk\s+(\d+)/,
        "minSdk"
      )
    ),
  compileSdk:
    Number(
      matchGradle(
        /compileSdk\s+(\d+)/,
        "compileSdk"
      )
    ),
  targetSdk:
    Number(
      matchGradle(
        /targetSdk\s+(\d+)/,
        "targetSdk"
      )
    )
};

const semver =
  packageJson.version.match(
    /^(\d+)\.(\d+)\.(\d+)$/
  );

let expectedVersionCode =
  null;

if (!semver) {
  errors.push(
    "package.json version must use major.minor.patch"
  );
} else {
  const [
    ,
    major,
    minor,
    patch
  ] = semver.map(Number);

  if (
    minor > 99 ||
    patch > 99
  ) {
    errors.push(
      "minor and patch must be <= 99 for Android versionCode mapping"
    );
  } else {
    expectedVersionCode =
      major * 10000 +
      minor * 100 +
      patch;
  }
}

const versionNames = [
  [
    "package-lock.json",
    packageLock.version
  ],
  [
    "package-lock root package",
    packageLock.packages?.[""]?.version
  ],
  [
    "ReleaseInfo",
    RELEASE_INFO.versionName
  ],
  [
    "Android",
    android.versionName
  ]
];

for (
  const [
    label,
    version
  ] of versionNames
) {
  if (
    version !==
    packageJson.version
  ) {
    errors.push(
      `${label} version ${version ?? "<missing>"} != package.json ${packageJson.version}`
    );
  }
}

if (
  expectedVersionCode !==
    null &&
  RELEASE_INFO.versionCode !==
    expectedVersionCode
) {
  errors.push(
    `ReleaseInfo versionCode ${RELEASE_INFO.versionCode} != expected ${expectedVersionCode}`
  );
}

if (
  expectedVersionCode !==
    null &&
  android.versionCode !==
    expectedVersionCode
) {
  errors.push(
    `Android versionCode ${android.versionCode} != expected ${expectedVersionCode}`
  );
}

for (
  const [
    label,
    releaseValue,
    androidValue
  ] of [
    [
      "packageName",
      RELEASE_INFO.packageName,
      android.packageName
    ],
    [
      "minSdk",
      RELEASE_INFO.minSdk,
      android.minSdk
    ],
    [
      "compileSdk",
      RELEASE_INFO.compileSdk,
      android.compileSdk
    ],
    [
      "targetSdk",
      RELEASE_INFO.targetSdk,
      android.targetSdk
    ]
  ]
) {
  if (
    releaseValue !==
    androidValue
  ) {
    errors.push(
      `${label} mismatch: ReleaseInfo=${releaseValue}, Android=${androidValue}`
    );
  }
}

if (errors.length > 0) {
  console.error(
    "Version metadata is inconsistent:"
  );

  for (const error of errors) {
    console.error(
      "-",
      error
    );
  }

  process.exit(1);
}

console.log(
  "Version metadata aligned:",
  packageJson.version,
  `versionCode=${expectedVersionCode}`,
  android.packageName,
  `sdk=${android.minSdk}/${android.targetSdk}/${android.compileSdk}`
);
