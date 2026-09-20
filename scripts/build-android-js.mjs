import fs from "node:fs";
import path from "node:path";

import {
  build
} from "esbuild";

import {
  RELEASE_INFO
} from "../src/release/ReleaseInfo.js";

const outputDirectory =
  path.resolve(
    "android/app/src/main/assets"
  );

const styleSources =
  Object.freeze([
    "src/ui-v2/tokens/tokens.css",
    "src/ui-v2/shell/app-shell.css",
    "src/ui-v2/components/global-hud.css",
    "src/ui-v2/components/global-nav.css",
    "src/ui-v2/pages/city/city-page.css",
    "src/ui-v2/assets/ui-assets.css"
  ]);

fs.rmSync(
  outputDirectory,
  {
    recursive: true,
    force: true
  }
);

fs.mkdirSync(
  outputDirectory,
  {
    recursive: true
  }
);

fs.cpSync(
  path.resolve(
    "assets/ui-v2"
  ),
  path.join(
    outputDirectory,
    "ui-v2"
  ),
  {
    recursive: true
  }
);

await build({
  entryPoints: [
    "src/runtime/AndroidBootstrap.js"
  ],
  outfile:
    path.join(
      outputDirectory,
      "game.js"
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

const css =
  styleSources
    .map(
      source =>
        fs.readFileSync(
          path.resolve(
            source
          ),
          "utf8"
        )
    )
    .join(
      "\n\n"
    );

fs.writeFileSync(
  path.join(
    outputDirectory,
    "game.css"
  ),
  css
);

const index = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
  >
  <title>${RELEASE_INFO.appName}</title>
  <link
    rel="stylesheet"
    href="game.css"
  >
  <style>
    html,
    body,
    #app {
      width:100%;
      height:100%;
      margin:0;
      padding:0;
    }

    body {
      overflow:hidden;
      background:#000;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script src="game.js"></script>
</body>
</html>
`;

fs.writeFileSync(
  path.join(
    outputDirectory,
    "index.html"
  ),
  index
);

console.log(
  "Android UI V2 bootstrap ready:",
  outputDirectory
);
