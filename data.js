const SchoolData = (() => {
  const WARDS = [
    "千代田区",
    "中央区",
    "港区",
    "新宿区",
    "文京区",
    "台東区",
    "墨田区",
    "江東区",
    "品川区",
    "目黒区",
    "大田区",
    "世田谷区",
    "渋谷区",
    "中野区",
    "杉並区",
    "豊島区",
    "北区",
    "荒川区",
    "板橋区",
    "練馬区",
    "足立区",
    "葛飾区",
    "江戸川区",
  ];

  const TIER_WEIGHTS = {
    S: 80,
    A: 70,
    B: 60,
    C: 50,
  };

  const UNIVERSITY_GROUPS = {
    S: [
      "東京大学",
      "京都大学",
      "一橋大学",
      "東京科学大学",
      "北海道大学",
      "東北大学",
      "名古屋大学",
      "大阪大学",
      "九州大学",
      "筑波大学",
    ],
    A: [
      "早稲田大学",
      "慶應義塾大学",
      "上智大学",
      "東京理科大学",
      "千葉大学",
      "横浜国立大学",
    ],
    B: ["明治大学", "青山学院大学", "立教大学", "中央大学", "法政大学"],
    C: [
      "日本大学",
      "東洋大学",
      "駒澤大学",
      "専修大学",
      "大正大学",
      "帝京大学",
      "東海大学",
      "亜細亜大学",
      "国士舘大学",
    ],
  };

  const UNIVERSITY_ALIASES = {
    東京大: "東京大学",
    京都大: "京都大学",
    一橋大: "一橋大学",
    東京科学大: "東京科学大学",
    北海道大: "北海道大学",
    東北大: "東北大学",
    名古屋大: "名古屋大学",
    大阪大: "大阪大学",
    九州大: "九州大学",
    筑波大: "筑波大学",
    千葉大: "千葉大学",
    横浜国立大: "横浜国立大学",
    早稲田大: "早稲田大学",
    慶應大: "慶應義塾大学",
    慶應義塾大: "慶應義塾大学",
    上智大: "上智大学",
    東京理科大: "東京理科大学",
    明治大: "明治大学",
    青学大: "青山学院大学",
    立教大: "立教大学",
    中央大: "中央大学",
    法政大: "法政大学",
    日本大: "日本大学",
    東洋大: "東洋大学",
    駒澤大: "駒澤大学",
    専修大: "専修大学",
    大正大: "大正大学",
  };

  const UNIVERSITY_TIER_MAP = buildUniversityTierMap(UNIVERSITY_GROUPS);
  const DEFAULT_TIER = "C";

  const SAMPLE_CSV = `id,year,slug,school_name,homepage_url,ward,type,gender,tier_s,tier_a,tier_b,tier_c,destinations,notes
11,2025,adachi-gakuen,足立学園高等学校,https://www.adachigakuen-jh.ed.jp/,足立区,私立,男子校,7.5,12.7,27.4,52.4,日本大学:76|東洋大学:33|東京理科大学:28|大正大学:27|法政大学:24,2025合格実績
12,2025,meiji-fuzoku-nakano,明治大学付属中野高等学校,https://www.nakanogakuen.ac.jp/,中野区,私立,男子校,1.8,85.2,12.2,0.8,明治大学:327|早稲田大学:16|慶應義塾大学:12,2025進路状況
13,2025,tokyo-gakugei-fuzoku,東京学芸大学附属高等学校,https://www.gakugei-hs.setagaya.tokyo.jp/,世田谷区,国立,共学,47.7,29.0,7.0,16.3,東京大学:20|東京科学大学:15|筑波大学:9,2025進路状況（学部合算）
14,2025,kaisei,開成高等学校,https://kaiseigakuen.jp/,荒川区,私立,男子校,0,0,0,0,東京大学:149|早稲田大学:48|慶應義塾大学:34|東京科学大学:21|千葉大学:21|一橋大学:16|京都大学:11|北海道大学:5|筑波大学:3|横浜国立大学:3|名古屋大学:2|九州大学:2,2025進路状況（開成高校PDF）`;

  async function loadSchools() {
    let csvText = "";
    let usedFallback = false;
    const dataPath = getDataPath();

    try {
      if (window.location.protocol === "file:") {
        throw new Error("file");
      }
      const response = await fetch(dataPath);
      if (!response.ok) {
        throw new Error("CSVの読み込みに失敗しました。");
      }
      csvText = await response.text();
    } catch (error) {
      csvText = SAMPLE_CSV;
      usedFallback = true;
    }

    const rows = parseCsv(csvText);
    const enriched = rows.map(enrichSchoolData).filter(Boolean);
    const grouped = groupSchoolsById(enriched);
    if (!grouped.length && !usedFallback) {
      const fallback = parseCsv(SAMPLE_CSV).map(enrichSchoolData).filter(Boolean);
      return groupSchoolsById(fallback);
    }
    return grouped;
  }

  function parseCsv(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }
    const lines = trimmed.split(/\r?\n/);
    if (lines.length <= 1) {
      return [];
    }
    const headers = lines[0].split(",").map((item) => item.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((item) => item.trim());
      return headers.reduce((acc, key, index) => {
        acc[key] = values[index] ?? "";
        return acc;
      }, {});
    });
  }

  function enrichSchoolData(row) {
    const year = parseYear(row.year);
    const slug = String(row.slug || "").trim();
    const websiteUrl = normalizeUrl(row.homepage_url);
    const tierS = parseNumber(row.tier_s);
    const tierA = parseNumber(row.tier_a);
    const tierB = parseNumber(row.tier_b);
    const tierC = parseNumber(row.tier_c);
    const destinations = parseDestinations(row.destinations);
    const destinationTiers = computeTiersFromDestinations(destinations);
    const tiers = destinationTiers ?? {
      S: tierS,
      A: tierA,
      B: tierB,
      C: tierC,
    };
    const advScore = computeAdvScore(tiers);

    return {
      id: row.id,
      year,
      slug,
      websiteUrl,
      name: row.school_name,
      ward: row.ward,
      type: row.type,
      gender: row.gender,
      tiers,
      advScore,
      destinations,
      notes: row.notes,
    };
  }

  function computeAdvScore(tiers) {
    if (!tiers) {
      return null;
    }
    const total = tiers.S + tiers.A + tiers.B + tiers.C;
    if (!total) {
      return null;
    }
    const weighted =
      tiers.S * TIER_WEIGHTS.S +
      tiers.A * TIER_WEIGHTS.A +
      tiers.B * TIER_WEIGHTS.B +
      tiers.C * TIER_WEIGHTS.C;
    return Math.round((weighted / total) * 10) / 10;
  }

  function parseDestinations(value) {
    if (!value) {
      return [];
    }
    return value
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [namePart, countPart] = item.split(":");
        const name = (namePart || "").trim();
        const count = parseNumber(countPart);
        return { name, count };
      })
      .filter((item) => item.name);
  }

  function computeTiersFromDestinations(destinations) {
    if (!destinations || !destinations.length) {
      return null;
    }
    const totals = { S: 0, A: 0, B: 0, C: 0 };
    let totalCount = 0;
    destinations.forEach((item) => {
      const count = parseNumber(item.count);
      if (!count) return;
      const tier = classifyUniversity(item.name);
      totals[tier] += count;
      totalCount += count;
    });
    if (!totalCount) {
      return null;
    }
    return {
      S: roundPercent(totals.S, totalCount),
      A: roundPercent(totals.A, totalCount),
      B: roundPercent(totals.B, totalCount),
      C: roundPercent(totals.C, totalCount),
    };
  }

  function roundPercent(count, total) {
    if (!total) return 0;
    return Math.round((count / total) * 1000) / 10;
  }

  function parseNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function normalizeUrl(value) {
    const trimmed = String(value || "").trim();
    return trimmed || "";
  }

  function normalizeUniversityName(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "";
    return UNIVERSITY_ALIASES[trimmed] ?? trimmed;
  }

  function classifyUniversity(name) {
    const normalized = normalizeUniversityName(name);
    if (!normalized) return DEFAULT_TIER;
    return UNIVERSITY_TIER_MAP.get(normalized) ?? DEFAULT_TIER;
  }

  function buildUniversityTierMap(groups) {
    const map = new Map();
    Object.entries(groups).forEach(([tier, names]) => {
      names.forEach((name) => {
        map.set(name, tier);
      });
    });
    return map;
  }

  function parseYear(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  }

  function groupSchoolsById(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      if (!entry || !entry.id) return;
      const id = String(entry.id);
      let school = map.get(id);
      if (!school) {
        school = {
          id,
          slug: entry.slug || id,
          websiteUrl: entry.websiteUrl || "",
          name: entry.name,
          ward: entry.ward,
          type: entry.type,
          gender: entry.gender,
          years: [],
        };
        map.set(id, school);
      }
      if (!school.slug && entry.slug) {
        school.slug = entry.slug;
      }
      if (!school.websiteUrl && entry.websiteUrl) {
        school.websiteUrl = entry.websiteUrl;
      }
      school.years.push({
        year: entry.year,
        tiers: entry.tiers,
        advScore: entry.advScore,
        destinations: entry.destinations,
        notes: entry.notes,
      });
    });

    return Array.from(map.values()).map((school) => {
      const years = [...school.years].sort(
        (a, b) => (b.year ?? 0) - (a.year ?? 0)
      );
      const latest = years[0] ?? null;
      const fallbackTiers = { S: 0, A: 0, B: 0, C: 0 };
      return {
        ...school,
        years,
        latestYear: latest?.year ?? null,
        tiers: latest?.tiers ?? fallbackTiers,
        advScore: latest?.advScore ?? null,
        destinations: latest?.destinations ?? [],
        notes: latest?.notes ?? "",
      };
    });
  }

  function getDataPath() {
    const path = window.location.pathname;
    return path.includes("/schools/") ? "../data/schools.csv" : "data/schools.csv";
  }

  return {
    WARDS,
    loadSchools,
  };
})();

window.SchoolData = SchoolData;
