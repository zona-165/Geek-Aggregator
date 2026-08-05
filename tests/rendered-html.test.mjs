import assert from "node:assert/strict";
import test from "node:test";

test("product source contains the content workbench", async () => {
  const source = await (await import("node:fs/promises")).readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /极客采集台/);
  assert.match(source, /deepseek-v4-flash/);
  assert.match(source, /复制公众号素材/);
  assert.match(source, /标记已发布/);
});
