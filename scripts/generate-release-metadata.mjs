import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import {
  RELEASE_INFO
} from "../src/release/ReleaseInfo.js";


const [
  apkPathArg,
  outputPathArg =
    "release-metadata.json"
] =
  process.argv.slice(2);


if (!apkPathArg) {
  throw new Error(
    "APK path is required"
  );
}


const apkPath =
  path.resolve(
    apkPathArg
  );

const outputPath =
  path.resolve(
    outputPathArg
  );


if (
  !fs.existsSync(
    apkPath
  )
) {
  throw new Error(
    "APK does not exist: " +
    apkPath
  );
}


const bytes =
  fs.readFileSync(
    apkPath
  );

const sha256 =
  crypto
    .createHash(
      "sha256"
    )
    .update(
      bytes
    )
    .digest(
      "hex"
    );


const metadata = {
  ...RELEASE_INFO,

  artifact:
    path.basename(
      apkPath
    ),

  bytes:
    bytes.length,

  sha256,

  gitSha:
    process.env
      .GITHUB_SHA ??
    null,

  runId:
    process.env
      .GITHUB_RUN_ID ??
    null,

  builtAt:
    new Date()
      .toISOString(),

  signing:
    "stable-playtest-key",

  productionReady:
    false,

  productionBlocker:
    "正式上架前必须替换为生产签名证书与正式包名策略"
};


fs.writeFileSync(
  outputPath,
  JSON.stringify(
    metadata,
    null,
    2
  ) +
    "\n"
);


console.log(
  "Release metadata ready:",
  outputPath
);

console.log(
  "SHA-256:",
  sha256
);
