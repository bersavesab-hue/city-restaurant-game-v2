import fs from "node:fs";
import path from "node:path";

import {
  build
} from "esbuild";

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
  sourcemap: false,
  minify: true,
  logLevel: "info"
});

for (
  const file
  of [
    "index.html",
    "app.css"
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
