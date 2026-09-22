import fs from "node:fs";
import path from "node:path";

import {
  build
} from "esbuild";

const webOutput =
  path.resolve(
    "dist/scene-playtest"
  );

const androidAssets =
  path.resolve(
    "playtest/android/app/src/main/assets"
  );

for (
  const directory
  of [
    webOutput,
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
    "playtest/scene/ScenePlaytest.js"
  ],
  outfile:
    path.join(
      webOutput,
      "scene.js"
    ),
  bundle: true,
  platform: "browser",
  format: "iife",
  target: [
    "chrome100"
  ],
  sourcemap: false,
  minify: false,
  logLevel: "info"
});

for (
  const file
  of [
    "index.html",
    "scene.css"
  ]
) {
  fs.copyFileSync(
    path.resolve(
      "playtest/scene",
      file
    ),
    path.join(
      webOutput,
      file
    )
  );
}

fs.cpSync(
  webOutput,
  androidAssets,
  {
    recursive: true
  }
);

console.log(
  "Scene playtest built:",
  webOutput
);

console.log(
  "Android playtest assets built:",
  androidAssets
);
