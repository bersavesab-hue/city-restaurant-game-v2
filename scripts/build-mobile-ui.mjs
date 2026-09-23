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

const heroSourceDirectory =
  path.resolve(
    "client/mobile/assets-src/home"
  );

const heroParts =
  fs.readdirSync(
    heroSourceDirectory
  )
    .filter(
      name =>
        /^restaurant-hero\.part\d+\.b64$/
          .test(name)
    )
    .sort(
      (a, b) =>
        Number(
          a.match(/part(\d+)/)?.[1] ?? 0
        ) -
        Number(
          b.match(/part(\d+)/)?.[1] ?? 0
        )
    );

if (
  heroParts.length !== 4
) {
  throw new Error(
    `Expected 4 restaurant hero chunks, found ${heroParts.length}`
  );
}

const heroBase64 =
  heroParts
    .map(
      name =>
        fs.readFileSync(
          path.join(
            heroSourceDirectory,
            name
          ),
          "utf8"
        ).trim()
    )
    .join("");

const heroBytes =
  Buffer.from(
    heroBase64,
    "base64"
  );

if (
  heroBytes.length < 12000 ||
  heroBytes[0] !== 0xff ||
  heroBytes[1] !== 0xd8 ||
  heroBytes.at(-2) !== 0xff ||
  heroBytes.at(-1) !== 0xd9
) {
  throw new Error(
    "Restaurant hero asset decode failed"
  );
}

const heroOutputDirectory =
  path.join(
    output,
    "assets/home"
  );

fs.mkdirSync(
  heroOutputDirectory,
  {
    recursive: true
  }
);

fs.writeFileSync(
  path.join(
    heroOutputDirectory,
    "restaurant-hero.jpg"
  ),
  heroBytes
);

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
