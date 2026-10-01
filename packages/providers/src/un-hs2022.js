const HS2022_URL = "https://comtradeapi.un.org/files/v1/app/reference/H6.json";

const CURATED_ALIASES = {
  "threonine": [
    {
      hsCode: "292250",
      labels: { tr: "L-Treonin / Treonin", en: "L-Threonine / Threonine" },
      basis: "Curated classification candidate supported by national customs tariff/ruling examples under HS heading 2922.50."
    }
  ],
  "l threonine": [
    {
      hsCode: "292250",
      labels: { tr: "L-Treonin", en: "L-Threonine" },
      basis: "Curated classification candidate supported by national customs tariff/ruling examples under HS heading 2922.50."
    }
  ],
  "treonin": [
    {
      hsCode: "292250",
      labels: { tr: "L-Treonin / Treonin", en: "L-Threonine / Threonine" },
      basis: "Curated multilingual classification candidate under HS heading 2922.50."
    }
  ],
  "l treonin": [
    {
      hsCode: "292250",
      labels: { tr: "L-Treonin", en: "L-Threonine" },
      basis: "Curated multilingual classification candidate under HS heading 2922.50."
    }
  ],
  "aycicek": [
    {
      hsCode: "151211",
      labels: { tr: "Ham ayçiçek veya aspir yağı", en: "Crude sunflower-seed or safflower oil" },
      basis: "Multilingual search alias. Exact classification depends on whether the oil is crude or other/refined."
    },
    {
      hsCode: "151219",
      labels: { tr: "Diğer ayçiçek veya aspir yağları", en: "Other sunflower-seed or safflower oil" },
      basis: "Multilingual search alias. Exact classification depends on whether the oil is crude or other/refined."
    }
  ],
  "aycicek yagi": [
    {
      hsCode: "151211",
      labels: { tr: "Ham ayçiçek veya aspir yağı", en: "Crude sunflower-seed or safflower oil" },
      basis: "Multilingual search alias. Exact classification depends on whether the oil is crude or other/refined."
    },
    {
      hsCode: "151219",
      labels: { tr: "Diğer ayçiçek veya aspir yağları", en: "Other sunflower-seed or safflower oil" },
      basis: "Multilingual search alias. Exact classification depends on whether the oil is crude or other/refined."
    }
  ],
  "badem": [
    {
      hsCode: "080211",
      labels: { tr: "Kabuklu badem", en: "Almonds in shell" },
      basis: "Multilingual search alias. Exact classification depends on presentation."
    },
    {
      hsCode: "080212",
      labels: { tr: "Kabuksuz badem", en: "Shelled almonds" },
      basis: "Multilingual search alias. Exact classification depends on presentation."
    }
  ],
  "almond": [
    {
      hsCode: "080211",
      labels: { tr: "Kabuklu badem", en: "Almonds in shell" },
      basis: "Multilingual search alias. Exact classification depends on presentation."
    },
    {
      hsCode: "080212",
      labels: { tr: "Kabuksuz badem", en: "Shelled almonds" },
      basis: "Multilingual search alias. Exact classification depends on presentation."
    }
  ]
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchCatalog(timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(HS2022_URL, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "CTSEG-Trade-Cost/0.6"
      },
      signal: controller.signal,
      cf: { cacheTtl: 604800, cacheEverything: true }
    });

    if (!response.ok) {
      const body = await response.text();
      throw Object.assign(new Error("UN HS 2022 catalog request failed"), {
        detail: { status: response.status, body: body.slice(0, 500) }
      });
    }

    const json = await response.json();
    return Array.isArray(json?.results) ? json.results : [];
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("UN HS 2022 catalog timed out"), {
        detail: { code: "UN_HS_TIMEOUT", timeoutMs }
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function toCandidate(item, extra = {}) {
  const code = String(item.id || "").trim();
  const text = String(item.text || "").trim();
  return {
    hsCode: code,
    description: text.replace(new RegExp("^" + code + "\\s*-\\s*"), ""),
    parent: item.parent || null,
    isLeaf: String(item.isLeaf) === "1",
    aggregationLevel: Number(item.aggrlevel || code.length || 0),
    standardUnitAbbr: item.standardUnitAbbr || null,
    hsRevision: "HS2022",
    ...extra
  };
}

export async function getHs2022ByCode(code) {
  const catalog = await fetchCatalog();
  const item = catalog.find(x => String(x.id) === String(code));
  return item ? toCandidate(item) : null;
}

export async function searchHs2022(query, limit = 10) {
  const rawQuery = String(query || "").trim();
  const normalized = normalizeText(rawQuery);
  if (!normalized) return [];

  const catalog = await fetchCatalog();
  const aliases = CURATED_ALIASES[normalized] || [];
  const aliasByCode = new Map(aliases.map(x => [x.hsCode, x]));

  const scored = catalog
    .filter(item => Number(item.aggrlevel) === 6)
    .map(item => {
      const candidate = toCandidate(item);
      const hay = normalizeText(candidate.description);
      let score = 0;

      if (candidate.hsCode === rawQuery) score += 1000;
      if (/^\d+$/.test(rawQuery) && candidate.hsCode.startsWith(rawQuery)) {
        score += 700 - Math.min(500, candidate.hsCode.length - rawQuery.length);
      }
      if (hay === normalized) score += 200;
      if (hay.includes(normalized)) score += 100;

      const terms = normalized.split(" ").filter(Boolean);
      for (const term of terms) {
        if (hay.includes(term)) score += 12;
      }

      if (aliasByCode.has(candidate.hsCode)) score += 2000;

      return {
        ...candidate,
        score,
        matchType: aliasByCode.has(candidate.hsCode)
          ? "CURATED_ALIAS"
          : (/^\d+$/.test(rawQuery) && candidate.hsCode.startsWith(rawQuery))
            ? "CODE_PREFIX"
            : hay.includes(normalized)
              ? "TEXT"
              : "TERM"
      };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.hsCode.localeCompare(b.hsCode))
    .slice(0, limit)
    .map(({ score, ...item }) => item);

  for (const alias of aliases) {
    if (scored.some(x => x.hsCode === alias.hsCode)) continue;
    const target = catalog.find(x => String(x.id) === alias.hsCode);
    if (target) {
      scored.unshift(toCandidate(target, {
        matchType: "CURATED_ALIAS",
        aliasLabel: alias.labels?.en || null,
        localizedLabels: alias.labels || null,
        classificationBasis: alias.basis
      }));
    }
  }

  return scored
    .slice(0, limit)
    .map(item => {
      const alias = aliasByCode.get(item.hsCode);
      if (!alias) return item;
      return {
        ...item,
        aliasLabel: alias.labels?.en || null,
        localizedLabels: alias.labels || null,
        classificationBasis: alias.basis
      };
    });
}
