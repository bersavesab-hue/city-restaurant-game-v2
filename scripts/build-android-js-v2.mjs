import fs from "node:fs";
import path from "node:path";

import {
  build
} from "esbuild";


const outputDirectory =
  path.resolve(
    "android/app/src/main/assets"
  );


fs.rmSync(
  outputDirectory,
  {
    recursive:
      true,

    force:
      true
  }
);


fs.mkdirSync(
  outputDirectory,
  {
    recursive:
      true
  }
);


await build({
  entryPoints: [
    "src/ui/runtime/AndroidPlaytestEntryV2.js"
  ],

  outfile:
    path.join(
      outputDirectory,
      "game.js"
    ),

  bundle:
    true,

  platform:
    "browser",

  format:
    "iife",

  target: [
    "chrome100"
  ],

  sourcemap:
    false,

  minify:
    false,

  logLevel:
    "info",

  assetNames:
    "bundle-assets/[name]-[hash]",

  loader: {
    ".png":
      "file",

    ".jpg":
      "file",

    ".jpeg":
      "file",

    ".webp":
      "file",

    ".svg":
      "file"
  }
});


const index = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
  >
  <meta
    name="theme-color"
    content="#064b8e"
  >

  <title>
    城市餐厅 V2 测试版
  </title>

  <link
    rel="stylesheet"
    href="game.css"
  >

  <style>
    html,
    body,
    #app {
      width:100%;
      min-height:100%;
      margin:0;
      padding:0;
    }

    body {
      background:#dceffa;
      overscroll-behavior:none;
    }

    * {
      box-sizing:border-box;
    }
  </style>
</head>

<body>
  <div id="app">
    <div
      style="
        padding:32px;
        text-align:center;
        font-family:sans-serif;
        color:#175481;
      "
    >
      正在启动餐厅经营系统……
    </div>
  </div>

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


const projectAssets =
  path.resolve(
    "assets"
  );


if (
  fs.existsSync(
    projectAssets
  )
) {
  fs.cpSync(
    projectAssets,
    path.join(
      outputDirectory,
      "assets"
    ),
    {
      recursive:
        true
    }
  );
}


console.log(
  "Android V2 web bundle ready:",
  outputDirectory
);
