import test from "node:test";
import assert from "node:assert/strict";

test("HS 2022 provider module imports", async () => {
  const mod = await import("../../providers/src/un-hs2022.js");
  assert.equal(typeof mod.getHs2022ByCode, "function");
  assert.equal(typeof mod.searchHs2022, "function");
});


test("HS search normalization handles Turkish and commercial punctuation", async () => {
  const mod = await import("../../providers/src/un-hs2022.js");
  assert.equal(mod.normalizeHsSearchText("L-Threonine 98.5%"), "l threonine 98 5");
  assert.equal(mod.normalizeHsSearchText("Ayçiçek Yağı"), "aycicek yagi");
});

test("curated HS aliases match inside commercial product descriptions", async () => {
  const mod = await import("../../providers/src/un-hs2022.js");

  const threonine = mod.findCuratedHsAliases("L-Threonine 98.5% feed grade 25 kg bag");
  assert.equal(threonine[0]?.hsCode, "292250");

  const sunflower = mod.findCuratedHsAliases("Refined sunflower oil 5L PET");
  assert.equal(sunflower[0]?.hsCode, "151219");

  const almonds = mod.findCuratedHsAliases("Shelled almonds 12.5 kg cartons");
  assert.equal(almonds[0]?.hsCode, "080212");

  const pistachios = mod.findCuratedHsAliases("Kabuksuz Antep fıstığı");
  assert.equal(pistachios[0]?.hsCode, "080252");
});

test("curated HS alias matching avoids unsafe short substring matches", async () => {
  const mod = await import("../../providers/src/un-hs2022.js");
  assert.deepEqual(mod.findCuratedHsAliases("oilfield equipment"), []);
});
