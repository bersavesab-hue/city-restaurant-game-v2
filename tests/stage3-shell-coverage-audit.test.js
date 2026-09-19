import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const ROOT =
  path.resolve(
    path.dirname(
      fileURLToPath(
        import.meta.url
      )
    ),
    "../src/ui/pages"
  );


function walk(dir) {
  const out = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }

  return out;
}


test(
  "正式页面View统一接入游戏顶部栏",
  () => {
    const exceptions =
      new Set([
        "award-ceremony/AwardCeremonyView.js"
      ]);

    const missing =
      walk(ROOT)
        .filter(
          file =>
            /View\.js$/.test(file)
        )
        .map(
          file =>
            path.relative(ROOT, file)
              .replaceAll("\\", "/")
        )
        .filter(
          relative =>
            !exceptions.has(relative)
        )
        .filter(
          relative => {
            const source =
              fs.readFileSync(
                path.join(ROOT, relative),
                "utf8"
              );

            return !source.includes(
              "renderGameTopBar"
            );
          }
        )
        .sort();

    assert.deepEqual(
      missing,
      [],
      `仍有页面未统一顶部栏：${missing.join(", ")}`
    );
  }
);
