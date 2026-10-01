import test from "node:test";
import assert from "node:assert/strict";

test("HS 2022 provider module imports", async () => {
  const mod = await import("../../providers/src/un-hs2022.js");
  assert.equal(typeof mod.getHs2022ByCode, "function");
  assert.equal(typeof mod.searchHs2022, "function");
});
