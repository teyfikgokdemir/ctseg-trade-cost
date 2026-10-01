import test from "node:test";
import assert from "node:assert/strict";
import { parseWitsProducts } from "../../providers/src/wits.js";

test("parses official WITS namespaced product XML", () => {
  const xml = `
<wits:datasource xmlns:wits="http://wits.worldbank.org" datasourcecode="TRN" datasourceName="WITS - UNCTAD TRAINS" language="en" page="1" pages="1" per_page="50" total="2">
  <wits:products>
    <wits:product productcode="010110" isgroup="No" nomenclaturecode="HS" grouptype="N/A">
      <wits:productdescription>(2002-2011) - Pure-bred breeding animals</wits:productdescription>
      <wits:notes/>
    </wits:product>
    <wits:product productcode="010120" isgroup="No" nomenclaturecode="HS" grouptype="N/A">
      <wits:productdescription>(-2001) - Asses, mules and hinnies</wits:productdescription>
      <wits:notes/>
    </wits:product>
  </wits:products>
</wits:datasource>`;

  const products = parseWitsProducts(xml);
  assert.equal(products.length, 2);
  assert.deepEqual(products[0], {
    hsCode: "010110",
    description: "(2002-2011) - Pure-bred breeding animals",
    isGroup: "No",
    nomenclatureCode: "HS",
    groupType: "N/A",
    notes: null
  });
});
