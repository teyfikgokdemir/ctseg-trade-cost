const WITS_PRODUCT_BASE = "https://wits.worldbank.org/API/V1/wits/datasource/trn/product";

function decodeXml(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attr(attrs, names) {
  for (const name of names) {
    const re = new RegExp(name + '="([^"]*)"', "i");
    const m = attrs.match(re);
    if (m) return decodeXml(m[1]);
  }
  return null;
}

export function parseWitsProducts(xml) {
  const products = [];
  const re = /<(?:\w+:)?product\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?product>/gi;
  let match;

  while ((match = re.exec(xml)) !== null) {
    const attrs = match[1] || "";
    const inner = match[2] || "";
    const code = attr(attrs, ["productcode", "code"]) ||
      inner.match(/<(?:\w+:)?productcode>([^<]+)<\/(?:\w+:)?productcode>/i)?.[1] || null;
    const description = attr(attrs, ["description", "productdescription"]) ||
      inner.match(/<(?:\w+:)?productdescription>([\s\S]*?)<\/(?:\w+:)?productdescription>/i)?.[1] ||
      inner.match(/<(?:\w+:)?description>([\s\S]*?)<\/(?:\w+:)?description>/i)?.[1] ||
      inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (!code) continue;

    products.push({
      hsCode: String(code).trim(),
      description: decodeXml(description).trim(),
      isGroup: attr(attrs, ["isgroup", "isproductgroup"]),
      nomenclatureCode: attr(attrs, ["nomenclaturecode"]),
      groupType: attr(attrs, ["grouptype", "productgrouptype"]),
      notes: inner.match(/<(?:\w+:)?notes>([\s\S]*?)<\/(?:\w+:)?notes>/i)?.[1]?.trim() || null
    });
  }

  return products;
}

async function fetchXml(path, cacheTtl = 86400) {
  const response = await fetch(`${WITS_PRODUCT_BASE}/${path}`, {
    headers: { "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8" },
    cf: { cacheTtl, cacheEverything: true }
  });

  const text = await response.text();
  if (!response.ok) {
    throw Object.assign(new Error("WITS product metadata request failed"), {
      detail: { status: response.status, body: text.slice(0, 500) }
    });
  }
  return text;
}

export async function fetchWitsProductByCode(code) {
  const xml = await fetchXml(code, 604800);
  const products = parseWitsProducts(xml);
  return products.find(p => p.hsCode === code) || products[0] || null;
}

export async function searchWitsProducts(query, limit = 10) {
  const xml = await fetchXml("all", 604800);
  const products = parseWitsProducts(xml);

  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return products
    .map(product => {
      const hay = `${product.hsCode} ${product.description}`.toLowerCase();
      let score = 0;
      if (product.hsCode === q) score += 100;
      if (product.hsCode.startsWith(q) && /^\d+$/.test(q)) score += 50;
      if (hay.includes(q)) score += 30;
      for (const term of terms) if (hay.includes(term)) score += 5;
      return { ...product, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.hsCode.localeCompare(b.hsCode))
    .slice(0, limit)
    .map(({ score, ...product }) => product);
}
