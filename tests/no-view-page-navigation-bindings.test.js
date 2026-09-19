import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";


function collectJsFiles(
  directory
) {
  const result = [];

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
    const full =
      path.join(
        directory,
        entry.name
      );

    if (
      entry.isDirectory()
    ) {
      result.push(
        ...collectJsFiles(
          full
        )
      );

      continue;
    }

    if (
      entry.name.endsWith(
        ".js"
      )
    ) {
      result.push(
        full
      );
    }
  }

  return result;
}


test(
  "正式页面不再自行绑定data-page-target导航",
  () => {
    const pages =
      path.resolve(
        "src/ui/pages"
      );

    const offenders = [];

    for (
      const file
      of collectJsFiles(
        pages
      )
    ) {
      const source =
        fs.readFileSync(
          file,
          "utf8"
        );

      if (
        /querySelectorAll\(\s*["']\[data-page-target\]["']\s*\)/
          .test(
            source
          )
      ) {
        offenders.push(
          path.relative(
            process.cwd(),
            file
          )
        );
      }
    }

    assert.deepEqual(
      offenders,
      []
    );
  }
);


test(
  "Android运行时只保留统一页面导航监听入口",
  () => {
    const source =
      fs.readFileSync(
        path.resolve(
          "src/ui/runtime/AndroidPlaytestEntry.js"
        ),
        "utf8"
      );

    assert.match(
      source,
      /data-page-navigation-listener/
    );

    assert.match(
      source,
      /closest\?\.\(\s*["']\[data-page-target\]["']/
    );
  }
);
