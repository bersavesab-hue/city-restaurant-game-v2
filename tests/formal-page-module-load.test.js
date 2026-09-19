import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  pathToFileURL,
  fileURLToPath
} from "node:url";


const repoRoot =
  path.resolve(
    path.dirname(
      fileURLToPath(
        import.meta.url
      )
    ),
    ".."
  );


function walk(
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
        ...walk(
          full
        )
      );

      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(
        "PageSystem.js"
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
  "所有正式PageSystem模块都能被Node完整解析和加载",
  async () => {
    const pages =
      walk(
        path.join(
          repoRoot,
          "src/ui/pages"
        )
      );

    assert.ok(
      pages.length >
      0
    );

    const failures = [];

    for (
      const file
      of pages
    ) {
      try {
        await import(
          pathToFileURL(
            file
          ).href
        );
      } catch (
        error
      ) {
        failures.push({
          file:
            path.relative(
              repoRoot,
              file
            ),
          message:
            error?.message ??
            String(error)
        });
      }
    }

    assert.deepEqual(
      failures,
      [],
      "正式页面模块存在解析/加载失败：" +
      JSON.stringify(
        failures
      )
    );
  }
);
