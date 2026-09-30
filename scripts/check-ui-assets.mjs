import fs from "node:fs";
import path from "node:path";

const ROOT =
  process.cwd();

const manifestPath =
  path.resolve(
    ROOT,
    "assets/manifest.json"
  );

function fail(message) {
  console.error(
    `Asset check failed: ${message}`
  );

  process.exitCode = 1;
}

function parsePng(buffer) {
  const signature =
    buffer
      .subarray(
        0,
        8
      )
      .toString(
        "hex"
      );

  if (
    signature !==
    "89504e470d0a1a0a"
  ) {
    throw new Error(
      "not a PNG"
    );
  }

  const width =
    buffer.readUInt32BE(
      16
    );

  const height =
    buffer.readUInt32BE(
      20
    );

  const bitDepth =
    buffer[24];

  const colorType =
    buffer[25];

  let offset = 8;
  let hasTrns =
    false;

  while (
    offset + 12 <=
    buffer.length
  ) {
    const length =
      buffer.readUInt32BE(
        offset
      );

    const type =
      buffer
        .subarray(
          offset + 4,
          offset + 8
        )
        .toString(
          "ascii"
        );

    if (
      type ===
      "tRNS"
    ) {
      hasTrns =
        true;
    }

    offset +=
      12 + length;

    if (
      type ===
      "IEND"
    ) {
      break;
    }
  }

  return {
    width,
    height,
    bitDepth,
    colorType,
    hasAlpha:
      colorType === 4 ||
      colorType === 6 ||
      hasTrns
  };
}

const manifest =
  JSON.parse(
    fs.readFileSync(
      manifestPath,
      "utf8"
    )
  );

if (
  manifest.rules
    ?.dynamicDataMayBeBakedIntoArtwork !==
  false
) {
  fail(
    "dynamic data must be forbidden in artwork"
  );
}

const ids =
  new Set();

for (
  const asset
  of manifest.assets ??
  []
) {
  if (
    ids.has(
      asset.id
    )
  ) {
    fail(
      `duplicate asset id ${asset.id}`
    );
  }

  ids.add(
    asset.id
  );

  if (
    asset.dynamicDataBaked !==
    false
  ) {
    fail(
      `${asset.id} must declare dynamicDataBaked=false`
    );
  }

  const absolute =
    path.resolve(
      ROOT,
      asset.path
    );

  if (
    !fs.existsSync(
      absolute
    )
  ) {
    fail(
      `missing ${asset.path}`
    );

    continue;
  }

  const buffer =
    fs.readFileSync(
      absolute
    );

  let metadata =
    null;

  if (
    asset.path
      .toLowerCase()
      .endsWith(
        ".png"
      )
  ) {
    try {
      metadata =
        parsePng(
          buffer
        );
    } catch (
      error
    ) {
      fail(
        `${asset.path}: ${error.message}`
      );
    }
  }

  if (
    metadata &&
    asset.expected
  ) {
    if (
      metadata.width !==
        asset.expected.width ||
      metadata.height !==
        asset.expected.height
    ) {
      fail(
        `${asset.id} dimensions changed: expected ${asset.expected.width}x${asset.expected.height}, got ${metadata.width}x${metadata.height}`
      );
    }

    if (
      metadata.hasAlpha !==
      asset.expected.hasAlpha
    ) {
      fail(
        `${asset.id} alpha metadata changed: expected ${asset.expected.hasAlpha}, got ${metadata.hasAlpha}`
      );
    }
  }

  console.log(
    [
      asset.id,
      asset.status,
      metadata
        ? `${metadata.width}x${metadata.height}`
        : `${buffer.length} bytes`,
      metadata
        ? `alpha=${metadata.hasAlpha}`
        : ""
    ]
      .filter(
        Boolean
      )
      .join(
        " | "
      )
  );
}

for (
  const slot
  of manifest.slots ??
  []
) {
  if (
    slot.dynamicDataAllowed !==
    false
  ) {
    fail(
      `${slot.id} must declare dynamicDataAllowed=false`
    );
  }

  if (
    slot.runtimePath
  ) {
    const target =
      path.resolve(
        ROOT,
        slot.runtimePath
      );

    if (
      !fs.existsSync(
        target
      )
    ) {
      fail(
        `slot ${slot.id} points to missing ${slot.runtimePath}`
      );
    }
  }
}

if (
  process.exitCode
) {
  process.exit(
    process.exitCode
  );
}

console.log(
  `Asset manifest verified: ${manifest.assets?.length ?? 0} files, ${manifest.slots?.length ?? 0} slots.`
);
