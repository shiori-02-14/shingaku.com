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
    ss: 100,
    s: 85,
    a: 75,
    b: 65,
    c: 55,
    d: 45,
    e: 35,
  };

  const UNIVERSITY_GROUPS = {
    ss: [
      "東京大学",
      '京都大学',
      "一橋大学",
      "東京科学大学",
    ],
    s: [
      "北海道大学",
      "東北大学",
      "名古屋大学",
      "大阪大学",
      "九州大学",
      "早稲田大学",
      "慶應義塾大学",
    ],
    a: [
      "筑波大学",
      "横浜国立大学",
      "千葉大学",
      "電気通信大学",
      "東京農工大学",
      "名古屋工業大学",
      "京都工芸繊維大学",
      "上智大学",
      "東京理科大学",
    ],
    b: [
      "明治大学",
      "青山学院大学",
      "立教大学",
      "中央大学",
      "法政大学",
      "関西大学",
      "関西学院大学",
      "同志社大学",
      "立命館大学",
      "神戸大学",
      "東京学芸大学",
      "東京外国語大学",
      "東京海洋大学",
      "お茶の水女子大学",
      "東京都立大学",
      "横浜市立大学",
      "大阪公立大学",
      "宇都宮大学",
      "富山大学",
      "山梨大学",
      "群馬大学",
      "茨城大学",
      "秋田大学",
      "高崎経済大学",
      "前橋工科大学",
      "気象大学校",
      "帯広畜産大学",
      "長崎大学",
      "琉球大学",
      "防衛大学校",
      "防衛医科大学校",
    ],
    c: [
      "成蹊大学",
      "成城大学",
      "明治学院大学",
      "学習院大学",
      "芝浦工業大学",
      "東京都市大学",
      "工学院大学",
      "東京電機大学",
      "獨協大学",
      "國學院大学",
      "武蔵大学",
      "埼玉大学",
      "信州大学",
      "静岡大学",
      "滋賀大学",
      "新潟大学",
    ],
    d: [
      "日本大学",
      "東洋大学",
      "駒澤大学",
      "専修大学",
      "京都産業大学",
      "近畿大学",
      "甲南大学",
      "龍谷大学",
    ],
    e: [],
  };

  const UNIVERSITY_ALIASES = {
    東京大: "東京大学",
    京都大: "京都大学",
    一橋大: "一橋大学",
    東京科学大: "東京科学大学",
    東京工大: "東京科学大学",
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
    関西大: "関西大学",
    関学大: "関西学院大学",
    関西学院大: "関西学院大学",
    同志社大: "同志社大学",
    立命館大: "立命館大学",
    成蹊大: "成蹊大学",
    成城大: "成城大学",
    明治学院大: "明治学院大学",
    学習院大: "学習院大学",
    芝浦工業大: "芝浦工業大学",
    東京都市大: "東京都市大学",
    工学院大: "工学院大学",
    東京電機大: "東京電機大学",
    獨協大: "獨協大学",
    國學院大: "國學院大学",
    武蔵大: "武蔵大学",
    日本大: "日本大学",
    東洋大: "東洋大学",
    駒澤大: "駒澤大学",
    専修大: "専修大学",
    京都産業大: "京都産業大学",
    近畿大: "近畿大学",
    甲南大: "甲南大学",
    龍谷大: "龍谷大学",
    電気通信大: "電気通信大学",
    東京農工大: "東京農工大学",
    名古屋工業大: "名古屋工業大学",
    京都工芸繊維大: "京都工芸繊維大学",
    神戸大: "神戸大学",
    東京学芸大: "東京学芸大学",
    東京外国語大: "東京外国語大学",
    東京海洋大: "東京海洋大学",
    お茶の水女子大: "お茶の水女子大学",
    東京都立大: "東京都立大学",
    横浜市立大: "横浜市立大学",
    大阪公立大: "大阪公立大学",
    埼玉大: "埼玉大学",
    信州大: "信州大学",
    静岡大: "静岡大学",
    滋賀大: "滋賀大学",
    新潟大: "新潟大学",
    宇都宮大: "宇都宮大学",
    富山大: "富山大学",
    山梨大: "山梨大学",
    群馬大: "群馬大学",
    茨城大: "茨城大学",
    秋田大: "秋田大学",
    高崎経済大: "高崎経済大学",
    前橋工科大: "前橋工科大学",
    帯広畜産大: "帯広畜産大学",
    長崎大: "長崎大学",
    琉球大: "琉球大学",
    防衛大: "防衛大学校",
    防衛医科大: "防衛医科大学校",
    大正大: "大正大学",
  };

  const PUBLIC_UNIVERSITY_NAMES = new Set([
    "北海道大学",
    "北海道教育大学",
    "室蘭工業大学",
    "小樽商科大学",
    "帯広畜産大学",
    "北見工業大学",
    "旭川医科大学",
    "弘前大学",
    "岩手大学",
    "東北大学",
    "宮城教育大学",
    "秋田大学",
    "山形大学",
    "福島大学",
    "茨城大学",
    "筑波大学",
    "筑波技術大学",
    "宇都宮大学",
    "群馬大学",
    "埼玉大学",
    "千葉大学",
    "東京大学",
    "東京外国語大学",
    "東京学芸大学",
    "東京農工大学",
    "東京藝術大学",
    "東京科学大学",
    "東京海洋大学",
    "お茶の水女子大学",
    "電気通信大学",
    "一橋大学",
    "政策研究大学院大学",
    "横浜国立大学",
    "総合研究大学院大学",
    "山梨大学",
    "信州大学",
    "新潟大学",
    "長岡技術科学大学",
    "上越教育大学",
    "富山大学",
    "金沢大学",
    "北陸先端科学技術大学院大学",
    "福井大学",
    "岐阜大学",
    "静岡大学",
    "浜松医科大学",
    "名古屋大学",
    "愛知教育大学",
    "名古屋工業大学",
    "豊橋技術科学大学",
    "三重大学",
    "滋賀大学",
    "滋賀医科大学",
    "京都大学",
    "京都教育大学",
    "京都工芸繊維大学",
    "大阪大学",
    "大阪教育大学",
    "神戸大学",
    "兵庫教育大学",
    "奈良教育大学",
    "奈良女子大学",
    "奈良先端科学技術大学院大学",
    "和歌山大学",
    "鳥取大学",
    "島根大学",
    "岡山大学",
    "広島大学",
    "山口大学",
    "徳島大学",
    "鳴門教育大学",
    "香川大学",
    "愛媛大学",
    "高知大学",
    "九州大学",
    "福岡教育大学",
    "九州工業大学",
    "佐賀大学",
    "長崎大学",
    "熊本大学",
    "大分大学",
    "宮崎大学",
    "鹿児島大学",
    "鹿屋体育大学",
    "琉球大学",
    "大阪公立大学",
    "東京都立大学",
    "横浜市立大学",
    "高崎経済大学",
    "前橋工科大学",
    "福島県立医科大学",
    "京都市立芸術大学",
    "水産大学校",
    "気象大学校",
    "防衛医科大学校",
  ]);

  const PUBLIC_UNIVERSITY_PATTERNS = [
    /(?:都|道|府|県|市)立大学$/u,
    /公立大学$/u,
    /大学校$/u,
  ];

  const UNIVERSITY_TIER_MAP = buildUniversityTierMap(UNIVERSITY_GROUPS);
  const DEFAULT_TIER = "e";

  const SAMPLE_CSV = `year,slug,school_name,homepage_url,ward,type,gender,destinations,destinations_file,notes
2025,adachi-gakuen,足立学園高等学校,https://www.adachigakuen-jh.ed.jp/,足立区,私立,男子校,麗澤大学:80|日本大学:76|千葉工業大学:44,,2025合格実績
2025,meiji-fuzoku-nakano,明治大学付属中野高等学校,https://www.nakanogakuen.ac.jp/,中野区,私立,男子校,明治大学:328|東京理科大学:21|早稲田大学:16,,2025進路状況
2025,tokyo-gakugei-fuzoku,東京学芸大学附属高等学校,https://www.gakugei-hs.setagaya.tokyo.jp/,世田谷区,国立,共学,早稲田大学:97|明治大学:84|東京理科大学:82,,2025進路状況（学部合算）
2025,kaisei,開成高等学校,https://kaiseigakuen.jp/,荒川区,私立,男子校,早稲田大学:257|慶應義塾大学:172|東京大学:150,,2025進路状況（開成高校PDF）`;

  async function loadSchools() {
    let csvText = "";
    let usedFallback = false;
    const dataPath = getDataPath();

    try {
      const response = await fetch(dataPath);
      if (!response.ok) {
        throw new Error("CSVの読み込みに失敗しました。");
      }
      csvText = await response.text();
    } catch (error) {
      csvText = SAMPLE_CSV;
      usedFallback = true;
    }

    let rows = parseCsv(csvText);
    if (!usedFallback) {
      rows = await attachDestinationsFromFiles(rows, dataPath);
    }
    const enriched = rows.map(enrichSchoolData).filter(Boolean);
    const grouped = groupSchoolsBySlug(enriched);
    if (!grouped.length && !usedFallback) {
      const fallback = parseCsv(SAMPLE_CSV).map(enrichSchoolData).filter(Boolean);
      return groupSchoolsBySlug(fallback);
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
    if (!slug) return null;
    const websiteUrl = normalizeUrl(row.homepage_url);
    const tierSs = parseNumber(row.tier_ss);
    const tierS = parseNumber(row.tier_s);
    const tierA = parseNumber(row.tier_a);
    const tierB = parseNumber(row.tier_b);
    const tierC = parseNumber(row.tier_c);
    const tierD = parseNumber(row.tier_d);
    const tierE = parseNumber(row.tier_e);
    const destinations = parseDestinations(row.destinations);
    const destinationTiers = computeTiersFromDestinations(destinations);
    const tiers = destinationTiers ?? {
      ss: tierSs,
      s: tierS,
      a: tierA,
      b: tierB,
      c: tierC,
      d: tierD,
      e: tierE,
    };
    const advScore = computeAdvScore(tiers);

    return {
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
    const total = tiers.ss + tiers.s + tiers.a + tiers.b + tiers.c + tiers.d + tiers.e;
    if (!total) {
      return null;
    }
    const weighted =
      tiers.ss * TIER_WEIGHTS.ss +
      tiers.s * TIER_WEIGHTS.s +
      tiers.a * TIER_WEIGHTS.a +
      tiers.b * TIER_WEIGHTS.b +
      tiers.c * TIER_WEIGHTS.c +
      tiers.d * TIER_WEIGHTS.d +
      tiers.e * TIER_WEIGHTS.e;
    return Math.round((weighted / total) * 10) / 10;
  }

  function parseDestinations(value) {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => normalizeDestinationEntry(item))
        .filter((item) => item && item.name);
    }
    return value
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separatorIndex = item.lastIndexOf(":");
        if (separatorIndex < 0) {
          return null;
        }
        const namePart = item.slice(0, separatorIndex);
        const countPart = item.slice(separatorIndex + 1);
        return normalizeDestinationEntry({
          name: namePart,
          count: countPart,
        });
      })
      .filter((item) => item && item.name);
  }

  async function attachDestinationsFromFiles(rows, dataPath) {
    const dataUrl = new URL(dataPath, window.location.href);
    const dataDir = new URL("./", dataUrl);
    const pageDir = new URL("./", window.location.href);
    const cache = new Map();
    const tasks = rows.map(async (row) => {
      const filePath = String(row.destinations_file || "").trim();
      if (!filePath) return [row];
      try {
        let text = cache.get(filePath);
        if (!text) {
          const url = resolveDestinationUrl(filePath, dataDir, pageDir);
          if (!url) return [row];
          const response = await fetch(url);
          if (!response.ok) return [row];
          text = await response.text();
          cache.set(filePath, text);
        }
        const parsed = parseDestinationsCsvByYear(text);
        const yearValue = parseYear(row.year);
        if (!Number.isFinite(yearValue)) {
          if (parsed.years.length) {
            return parsed.years.map((year) => ({
              ...row,
              year,
              destinations: parsed.byYear.get(year) ?? [],
            }));
          }
          if (parsed.noYear.length) {
            return [{ ...row, destinations: parsed.noYear }];
          }
          return [row];
        }
        const destinations = parsed.hasYearColumn
          ? parsed.byYear.get(yearValue) ?? []
          : parsed.noYear;
        return [{ ...row, destinations }];
      } catch (error) {
        return [row];
      }
    });
    const resolved = await Promise.all(tasks);
    return resolved.flat();
  }

  function resolveDestinationUrl(filePath, dataDir, pageDir) {
    const raw = String(filePath || "").trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("data/") || raw.startsWith("./data/")) {
      return new URL(raw.replace(/^\.\//, ""), pageDir).toString();
    }
    return new URL(raw, dataDir).toString();
  }

  function parseDestinationsCsv(text, filterYear = null) {
    const parsed = parseDestinationsCsvByYear(text);
    if (Number.isFinite(filterYear) && parsed.hasYearColumn) {
      return parsed.byYear.get(Number(filterYear)) ?? [];
    }
    if (Number.isFinite(filterYear) && !parsed.hasYearColumn) {
      return parsed.noYear;
    }
    if (!Number.isFinite(filterYear)) {
      const all = [];
      parsed.byYear.forEach((list) => all.push(...list));
      if (parsed.noYear.length) {
        all.push(...parsed.noYear);
      }
      return all;
    }
    return parsed.noYear;
  }

  function parseDestinationsCsvByYear(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) {
      return { byYear: new Map(), years: [], noYear: [], hasYearColumn: false };
    }
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    if (!lines.length) {
      return { byYear: new Map(), years: [], noYear: [], hasYearColumn: false };
    }
    const rows = lines.map((line) =>
      line.split(",").map((cell) => cell.trim())
    );
    const header = rows[0] ?? [];
    const headerMap = header.reduce((acc, cell, index) => {
      const key = String(cell || "").trim().toLowerCase();
      if (/^(year|年度)$/i.test(key)) {
        acc.year = index;
      } else if (/^(name|大学名|university)$/i.test(key)) {
        acc.name = index;
      } else if (/^(count|人数|合格者数)$/i.test(key)) {
        acc.count = index;
      } else if (/^(is_overseas|overseas|海外|海外大)$/i.test(key)) {
        acc.overseas = index;
      } else if (/^(category|区分|分類|種別)$/i.test(key)) {
        acc.category = index;
      }
      return acc;
    }, {});
    const hasHeader = Object.keys(headerMap).length > 0;
    const hasYearColumn = headerMap.year != null;
    const startIndex = hasHeader ? 1 : 0;
    const byYear = new Map();
    const noYear = [];
    rows.slice(startIndex).forEach((row) => {
      const yearValue =
        hasYearColumn && hasHeader ? parseYear(row[headerMap.year]) : null;
      const name = hasHeader ? row[headerMap.name ?? 0] : row[0];
      const count = hasHeader ? row[headerMap.count ?? 1] : row[1];
      const overseas = hasHeader ? row[headerMap.overseas ?? 2] : row[2];
      const category = hasHeader ? row[headerMap.category ?? 3] : row[3];
      const entry = normalizeDestinationEntry({
        name,
        count,
        isOverseas: parseOverseasFlag(overseas),
        category,
      });
      if (!entry || !entry.name) return;
      if (Number.isFinite(yearValue)) {
        if (!byYear.has(yearValue)) {
          byYear.set(yearValue, []);
        }
        byYear.get(yearValue).push(entry);
      } else {
        noYear.push(entry);
      }
    });
    const years = Array.from(byYear.keys()).sort((a, b) => b - a);
    return { byYear, years, noYear, hasYearColumn };
  }

  function parseOverseasFlag(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return (
      normalized === "1" ||
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "y" ||
      normalized === "海外"
    );
  }

  function normalizeDestinationEntry(entry) {
    if (!entry) return null;
    if (Array.isArray(entry)) {
      return normalizeDestinationEntry({
        name: entry[0],
        count: entry[1],
        isOverseas: entry[2],
      });
    }
    if (typeof entry === "string") {
      return normalizeDestinationEntry({ name: entry, count: 0 });
    }
    const rawName = String(entry.name || "").trim();
    if (!rawName) return null;
    const overseasMatch = rawName.match(/^(海外大学|海外大|海外):\s*(.+)$/u);
    const normalizedCategory = normalizeDestinationCategory(
      entry.category ?? entry.type ?? entry.group
    );
    const isOverseas =
      normalizedCategory === "overseas" ||
      Boolean(entry.isOverseas) ||
      Boolean(entry.overseas) ||
      Boolean(overseasMatch);
    const name = (overseasMatch ? overseasMatch[2] : rawName).trim();
    if (!name) return null;
    const isMedical =
      normalizedCategory === "medical" || isMedicalDestinationName(name);
    const count = parseNumber(entry.count);
    const category =
      isOverseas
        ? "overseas"
        : isMedical
        ? "medical"
        : normalizedCategory ??
          (isPublicUniversityName(name) ? "public" : "private");
    return { name, count, isOverseas: category === "overseas", category };
  }

  function normalizeDestinationCategory(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) return null;
    if (/(海外|overseas)/u.test(normalized)) return "overseas";
    if (/(医学部|medical)/u.test(normalized)) return "medical";
    if (/(国公立|国立|公立|public)/u.test(normalized)) return "public";
    if (/(私立|private)/u.test(normalized)) return "private";
    return null;
  }

  function isPublicUniversityName(name) {
    if (!name) return false;
    if (PUBLIC_UNIVERSITY_NAMES.has(name)) return true;
    return PUBLIC_UNIVERSITY_PATTERNS.some((pattern) => pattern.test(name));
  }

  function isMedicalDestinationName(name) {
    return /(医学部|医科大学)/u.test(String(name || "").trim());
  }

  function computeTiersFromDestinations(destinations) {
    if (!destinations || !destinations.length) {
      return null;
    }
    const totals = { ss: 0, s: 0, a: 0, b: 0, c: 0, d: 0, e: 0 };
    let totalCount = 0;
    destinations.forEach((item) => {
      if (item.isOverseas) return;
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
      ss: roundPercent(totals.ss, totalCount),
      s: roundPercent(totals.s, totalCount),
      a: roundPercent(totals.a, totalCount),
      b: roundPercent(totals.b, totalCount),
      c: roundPercent(totals.c, totalCount),
      d: roundPercent(totals.d, totalCount),
      e: roundPercent(totals.e, totalCount),
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
    const baseName = trimmed
      .replace(/\s*(（医学部）|（医）|医学部医学科|医学部\s*医学科|医学部)$/u, "")
      .trim();
    if (!baseName) return "";
    return UNIVERSITY_ALIASES[baseName] ?? baseName;
  }

  function classifyUniversity(name) {
    if (!name) return DEFAULT_TIER;
    // 医学部はssランク
    if (isMedicalDestinationName(name)) {
      return "ss";
    }
    const normalized = normalizeUniversityName(name);
    if (!normalized) return DEFAULT_TIER;
    const tier = UNIVERSITY_TIER_MAP.get(normalized);
    if (tier) return tier;
    // その他国立大学はbランク
    if (isPublicUniversityName(normalized)) {
      return "b";
    }
    // その他私立大学はeランク
    return DEFAULT_TIER;
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
    const trimmed = String(value ?? "").trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  }

  function groupSchoolsBySlug(entries) {
    const map = new Map();
    entries.forEach((entry) => {
      if (!entry || !entry.slug) return;
      const slug = String(entry.slug);
      let school = map.get(slug);
      if (!school) {
        school = {
          slug,
          websiteUrl: entry.websiteUrl || "",
          name: entry.name,
          ward: entry.ward,
          type: entry.type,
          gender: entry.gender,
          years: [],
        };
        map.set(slug, school);
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
      const fallbackTiers = { ss: 0, s: 0, a: 0, b: 0, c: 0, d: 0, e: 0 };
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
