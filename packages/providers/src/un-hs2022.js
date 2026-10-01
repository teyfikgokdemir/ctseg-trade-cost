const HS2022_URL = "https://comtradeapi.un.org/files/v1/app/reference/H6.json";

const CURATED_ALIASES = {
  "threonine": {
    hsCode: "292250",
    label: "L-Threonine / Threonine",
    basis: "Curated classification candidate supported by national customs tariff/ruling examples under HS heading 2922.50."
  },
  "l-threonine": {
    hsCode: "292250",
    label: "L-Threonine",
    basis: "Curated classification candidate supported by national customs tariff/ruling examples under HS heading 2922.50."
  },
  "l threonine": {
    hsCode: "292250",
    label: "L-Threonine",
    basis: "Curated classification candidate supported by national customs tariff/ruling examples under HS heading 2922.50."
  }
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
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
  const alias = CURATED_ALIASES[normalized];

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

      if (alias?.hsCode === candidate.hsCode) score += 2000;

      return {
        ...candidate,
        score,
        matchType: alias?.hsCode === candidate.hsCode
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

  if (alias && !scored.some(x => x.hsCode === alias.hsCode)) {
    const target = catalog.find(x => String(x.id) === alias.hsCode);
    if (target) {
      scored.unshift(toCandidate(target, {
        matchType: "CURATED_ALIAS",
        aliasLabel: alias.label,
        classificationBasis: alias.basis
      }));
      return scored.slice(0, limit);
    }
  }

  return scored.map(item => {
    if (alias?.hsCode === item.hsCode) {
      return {
        ...item,
        aliasLabel: alias.label,
        classificationBasis: alias.basis
      };
    }
    return item;
  });
}
