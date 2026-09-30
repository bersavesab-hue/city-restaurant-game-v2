import fs from "node:fs";
import path from "node:path";

import {
  build
} from "esbuild";

const packageJson =
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        "package.json"
      ),
      "utf8"
    )
  );

const buildGitSha =
  (
    process.env.GITHUB_SHA ??
    "local"
  ).slice(
    0,
    8
  );

const output =
  path.resolve(
    "dist/mobile-ui"
  );

const androidAssets =
  path.resolve(
    "mobile/android/app/src/main/assets"
  );

for (
  const directory
  of [
    output,
    androidAssets
  ]
) {
  fs.rmSync(
    directory,
    {
      recursive: true,
      force: true
    }
  );

  fs.mkdirSync(
    directory,
    {
      recursive: true
    }
  );
}

await build({
  entryPoints: [
    "client/mobile/MobileApp.js"
  ],
  outfile:
    path.join(
      output,
      "app.js"
    ),
  bundle: true,
  platform: "browser",
  format: "iife",
  target: [
    "chrome100"
  ],
  define: {
    __APP_VERSION__:
      JSON.stringify(
        packageJson.version
      ),
    __BUILD_GIT_SHA__:
      JSON.stringify(
        buildGitSha
      )
  },
  sourcemap: false,
  minify: true,
  logLevel: "info"
});

for (
  const file
  of [
    "index.html",
    "app.css",
    "devtools.css"
  ]
) {
  fs.copyFileSync(
    path.resolve(
      "client/mobile",
      file
    ),
    path.join(
      output,
      file
    )
  );
}

const buildInfo = {
  version:
    packageJson.version,
  gitSha:
    buildGitSha,
  builtAt:
    new Date()
      .toISOString()
};

fs.writeFileSync(
  path.join(
    output,
    "build-info.json"
  ),
  JSON.stringify(
    buildInfo,
    null,
    2
  ) + "\n"
);

const mobileAssets =
  path.resolve(
    "client/mobile/assets"
  );

if (
  fs.existsSync(
    mobileAssets
  )
) {
  fs.cpSync(
    mobileAssets,
    path.join(
      output,
      "assets"
    ),
    {
      recursive: true
    }
  );
}

fs.cpSync(
  output,
  androidAssets,
  {
    recursive: true
  }
);

console.log(
  "Mobile UI built:",
  output
);

console.log(
  "Android assets built:",
  androidAssets
);

console.log(
  "Build:",
  packageJson.version,
  buildGitSha
);
