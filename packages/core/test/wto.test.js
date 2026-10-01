import test from "node:test";
import assert from "node:assert/strict";
import { parseWtoResponseBody } from "../../providers/src/wto.js";

test("WTO empty response is normalized as NO_DATA", () => {
  assert.deepEqual(parseWtoResponseBody("", 204), {
    status: "NO_DATA",
    httpStatus: 204,
    data: []
  });
});

test("WTO valid JSON response is parsed", () => {
  assert.deepEqual(parseWtoResponseBody('[{"value":5}]', 200), [{ value: 5 }]);
});
