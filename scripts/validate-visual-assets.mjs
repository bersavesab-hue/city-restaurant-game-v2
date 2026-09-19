import fs from "node:fs";
import path from "node:path";


const RULES =
  Object.freeze([
    {
      directory:
        "assets/images/scenes/restaurants",

      width:
        1600,

      height:
        900,

      label:
        "门店场景"
    },

    {
      directory:
        "assets/images/dishes/official",

      width:
        1024,

      height:
        1024,

      label:
        "正式菜品"
    },

    {
      directory:
        "assets/images/dishes/generated",

      width:
        1024,

      height:
        1024,

      label:
        "自研菜缓存图"
    },

    {
      directory:
        "assets/images/ui/common/icons",

      width:
        256,

      height:
        256,

      label:
        "正式UI图标"
    },

    {
      directory:
        "assets/images/ui/employees/avatars",

      width:
        1024,

      height:
        1536,

      label:
        "员工立绘"
    },

    {
      directory:
        "assets/images/dishes/components",

      width:
        1024,

      height:
        1024,

      label:
        "自研菜组件"
    }
  ]);


const IMAGE_EXTENSIONS =
  new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
  ]);


function listFiles(
  directory
) {
  if (
    !fs.existsSync(
      directory
    )
  ) {
    return [];
  }

  const result =
    [];

  for (
    const entry
    of fs.readdirSync(
      directory,
      {
        withFileTypes:
          true
      }
    )
  ) {
    const fullPath =
      path.join(
        directory,
        entry.name
      );

    if (
      entry.isDirectory()
    ) {
      result.push(
        ...listFiles(
          fullPath
        )
      );
    } else {
      result.push(
        fullPath
      );
    }
  }

  return result;
}


function pngSize(
  buffer
) {
  if (
    buffer.length <
    24 ||
    buffer.toString(
      "ascii",
      1,
      4
    ) !==
      "PNG"
  ) {
    return null;
  }

  return {
    width:
      buffer.readUInt32BE(
        16
      ),

    height:
      buffer.readUInt32BE(
        20
      )
  };
}


function jpegSize(
  buffer
) {
  if (
    buffer.length <
      4 ||
    buffer[0] !==
      0xff ||
    buffer[1] !==
      0xd8
  ) {
    return null;
  }

  const sof =
    new Set([
      0xc0,
      0xc1,
      0xc2,
      0xc3,
      0xc5,
      0xc6,
      0xc7,
      0xc9,
      0xca,
      0xcb,
      0xcd,
      0xce,
      0xcf
    ]);

  let offset =
    2;

  while (
    offset + 8 <
    buffer.length
  ) {
    if (
      buffer[
        offset
      ] !==
      0xff
    ) {
      offset +=
        1;

      continue;
    }

    const marker =
      buffer[
        offset + 1
      ];

    if (
      sof.has(
        marker
      )
    ) {
      return {
        height:
          buffer.readUInt16BE(
            offset + 5
          ),

        width:
          buffer.readUInt16BE(
            offset + 7
          )
      };
    }

    if (
      marker ===
        0xd8 ||
      marker ===
        0xd9
    ) {
      offset +=
        2;

      continue;
    }

    const length =
      buffer.readUInt16BE(
        offset + 2
      );

    if (
      length <
      2
    ) {
      return null;
    }

    offset +=
      2 +
      length;
  }

  return null;
}


function webpSize(
  buffer
) {
  if (
    buffer.length <
      30 ||
    buffer.toString(
      "ascii",
      0,
      4
    ) !==
      "RIFF" ||
    buffer.toString(
      "ascii",
      8,
      12
    ) !==
      "WEBP"
  ) {
    return null;
  }

  let offset =
    12;

  while (
    offset + 8 <=
    buffer.length
  ) {
    const type =
      buffer.toString(
        "ascii",
        offset,
        offset + 4
      );

    const size =
      buffer.readUInt32LE(
        offset + 4
      );

    const data =
      offset + 8;

    if (
      type ===
      "VP8X"
    ) {
      if (
        data + 10 >
        buffer.length
      ) {
        return null;
      }

      const width =
        1 +
        buffer[data + 4] +
        (
          buffer[
            data + 5
          ] <<
          8
        ) +
        (
          buffer[
            data + 6
          ] <<
          16
        );

      const height =
        1 +
        buffer[data + 7] +
        (
          buffer[
            data + 8
          ] <<
          8
        ) +
        (
          buffer[
            data + 9
          ] <<
          16
        );

      return {
        width,
        height
      };
    }

    if (
      type ===
      "VP8L"
    ) {
      if (
        data + 5 >
        buffer.length ||
        buffer[data] !==
          0x2f
      ) {
        return null;
      }

      const bits =
        buffer.readUInt32LE(
          data + 1
        );

      return {
        width:
          (
            bits &
            0x3fff
          ) +
          1,

        height:
          (
            (
              bits >>>
              14
            ) &
            0x3fff
          ) +
          1
      };
    }

    if (
      type ===
      "VP8 "
    ) {
      if (
        data + 10 >
        buffer.length
      ) {
        return null;
      }

      return {
        width:
          buffer.readUInt16LE(
            data + 6
          ) &
          0x3fff,

        height:
          buffer.readUInt16LE(
            data + 8
          ) &
          0x3fff
      };
    }

    offset =
      data +
      size +
      (
        size %
        2
      );
  }

  return null;
}


function readImageSize(
  file
) {
  const buffer =
    fs.readFileSync(
      file
    );

  const extension =
    path.extname(
      file
    )
      .toLowerCase();

  if (
    extension ===
    ".png"
  ) {
    return pngSize(
      buffer
    );
  }

  if (
    extension ===
      ".jpg" ||
    extension ===
      ".jpeg"
  ) {
    return jpegSize(
      buffer
    );
  }

  if (
    extension ===
    ".webp"
  ) {
    return webpSize(
      buffer
    );
  }

  return null;
}


const errors =
  [];

let checked =
  0;


for (
  const rule
  of RULES
) {
  const files =
    listFiles(
      rule.directory
    )
      .filter(
        file =>
          IMAGE_EXTENSIONS.has(
            path.extname(
              file
            )
              .toLowerCase()
          )
      );

  for (
    const file
    of files
  ) {
    checked +=
      1;

    const size =
      readImageSize(
        file
      );

    if (
      !size
    ) {
      errors.push(
        file +
        ": 无法读取图片尺寸"
      );

      continue;
    }

    if (
      size.width !==
        rule.width ||
      size.height !==
        rule.height
    ) {
      errors.push(
        file +
        ": " +
        size.width +
        "x" +
        size.height +
        "，" +
        rule.label +
        "必须为 " +
        rule.width +
        "x" +
        rule.height
      );
    }
  }
}


if (
  errors.length >
  0
) {
  console.error(
    "视觉资源分辨率校验失败："
  );

  for (
    const error
    of errors
  ) {
    console.error(
      " - " +
      error
    );
  }

  process.exit(
    1
  );
}


console.log(
  "视觉资源分辨率校验通过：检查 " +
  checked +
  " 个正式图片文件"
);
