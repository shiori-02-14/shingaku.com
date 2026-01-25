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
11,2025,adachi-gakuen,足立学園高等学校,https://www.adachigakuen-jh.ed.jp/,足立区,私立,男子校,7.5,12.7,27.4,52.4,麗澤大学:80|日本大学:76|千葉工業大学:44|東洋大学:33|東京理科大学:28|大正大学:27|法政大学:24|専修大学:21|東京電機大学:21|明治大学:18|獨協大学:18|立教大学:16|帝京大学:14|國學院大学:12|学習院大学:11|東海大学:9|立正大学:9|駒澤大学:9|東京農業大学:8|拓殖大学:7|早稲田大学:7|大東文化大学:6|成蹊大学:6|武蔵大学:6|日本工業大学:5|明星大学:5|明治学院大学:5|杏林大学:5|東京都市大学:5|芝浦工業大学:5|順天堂大学:5|中央学院大学:4|亜細亜大学:4|北里大学:4|千葉商科大学:4|工学院大学:4|文教大学:4|日本体育大学:4|東邦大学:4|桜美林大学:4|横浜薬科大学:4|流通経済大学:4|神奈川大学:4|中部大学:3|二松學舍大学:3|山梨学院大学:3|慶應義塾大学:3|成城大学:3|同志社大学:2|国際医療福祉大学:2|城西大学:2|日本獣医生命科学大学:2|東京大学:2|東京工科大学:2|東京工芸大学:2|東京経済大学:2|東京都立大学:2|石巻専修大学:2|立命館大学:2|筑波大学:2|青山学院大学:2|共栄大学:1|創価大学:1|千葉大学:1|国士舘大学:1|宮崎大学:1|岡山理科大学:1|帝京科学大学:1|帯広畜産大学:1|文京学院大学:1|文星芸術大学:1|日本経済大学:1|日本薬科大学:1|昭和薬科大学:1|東京医科大学:1|東京国際大学:1|東京未来大学:1|東京造形大学:1|武蔵野大学:1|水産大学校:1|江戸川大学:1|淑徳大学:1|湘南医療大学:1|玉川大学:1|産業能率大学:1|目白大学:1|神奈川工科大学:1|酪農学園大学:1|開智国際大学:1|関東学院大学:1|関西学院大学:1|麻布大学:1,2025合格実績
12,2025,meiji-fuzoku-nakano,明治大学付属中野高等学校,https://www.nakanogakuen.ac.jp/,中野区,私立,男子校,1.8,85.2,12.2,0.8,明治大学:328|東京理科大学:21|早稲田大学:16|慶應義塾大学:12|上智大学:7|中央大学:6|日本大学:6|法政大学:6|青山学院大学:4|明治学院大学:3|東海大学:3|立命館大学:3|立教大学:3|聖マリアンナ医科大学:3|芝浦工業大学:3|北海道大学:2|国際医療福祉大学:2|國學院大学:2|東北大学:2|東邦大学:2|兵庫医科大学:1|前橋工科大学:1|名古屋大学:1|埼玉大学:1|日本医科大学:1|明海大学:1|杏林大学:1|東京医科大学:1|東京外国語大学:1|東京慈恵会医科大学:1|東京科学大学:1|東京藝術大学:1|東京農工大学:1|東洋大学:1|横浜国立大学:1|気象大学校:1|筑波大学:1|長崎大学:1|順天堂大学:1|駒澤大学:1,2025進路状況
13,2025,tokyo-gakugei-fuzoku,東京学芸大学附属高等学校,https://www.gakugei-hs.setagaya.tokyo.jp/,世田谷区,国立,共学,47.7,29.0,7.0,16.3,早稲田大学:97|明治大学:84|東京理科大学:82|慶應義塾大学:76|中央大学:50|上智大学:37|法政大学:36|立教大学:33|日本大学:30|青山学院大学:23|東京大学:22|芝浦工業大学:17|学習院大学:12|一橋大学:11|明治学院大学:11|工学院大学:10|横浜国立大学:10|東洋大学:9|東京農業大学:8|東京都市大学:8|昭和女子大学:7|順天堂大学:7|東京科学大学:6|東邦大学（医学部）:6|立命館大学:6|京都大学:5|北里大学:5|北里大学（医学部）:5|国際医療福祉大学（医学部）:5|国際基督教大学:5|成蹊大学:5|昭和大学（医学部）:5|東京学芸大学:5|東海大学（医学部）:5|武蔵野美術大学:5|筑波大学:5|駒澤大学:5|東京女子大学:4|東京薬科大学:4|津田塾大学:4|お茶の水女子大学:3|共立女子大学:3|北海道大学:3|千葉大学:3|國學院大学:3|多摩美術大学:3|専修大学:3|杏林大学（医学部）:3|東京医科大学（医学部）:3|東京慈恵会医科大学（医学部）:3|東京農工大学:3|東北大学:3|獨協医科大学（医学部）:3|産業医科大学（医学部）:3|神奈川大学:3|近畿大学:3|同志社大学:2|大阪大学:2|島根大学（医学部）:2|成城大学:2|日本医科大学（医学部）:2|東京外国語大学:2|東京海洋大学:2|東京科学大学（医学部）:2|東京都立大学:2|東海大学:2|横浜市立大学:2|横浜薬科大学:2|獨協大学:2|玉川大学:2|琉球大学（医学部）:2|目白大学:2|藤田医科大学（医学部）:2|防衛医科大学校:2|順天堂大学（医学部）:2|海外:College of Wooster:1|海外:Ohio Wesleyan University:1|久留米大学（医学部）:1|九州大学:1|京都芸術大学:1|信州大学:1|信州大学（医学部）:1|千葉大学（医学部）:1|千葉工業大学:1|名古屋大学:1|国士舘大学:1|埼玉医科大学（医学部）:1|大妻女子大学:1|大阪公立大学:1|大阪大学（医学部）:1|女子栄養大学:1|学習院女子大学:1|宇都宮大学:1|富山大学:1|山形大学（医学部）:1|山梨大学:1|山梨大学（医学部）:1|川崎医科大学（医学部）:1|帝京大学:1|帝京大学（医学部）:1|帯広畜産大学:1|海外:延世大学社会科学大学:1|弘前大学（医学部）:1|慶應義塾大学（医学部）:1|海外:成均館大学芸術大学:1|文京学院大学:1|新潟大学（医学部）:1|日本歯科大学:1|日本獣医生命科学大学（医学部）:1|旭川医科大学（医学部）:1|明治薬科大学:1|昭和大学:1|杏林大学:1|東京家政大学:1|東北大学（医学部）:1|東邦大学:1|桜美林大学:1|横浜市立大学（医学部）:1|武蔵大学:1|武蔵野大学:1|浜松医科大学（医学部）:1|滋賀医科大学（医学部）:1|海外:漢陽大学:1|産業能率大学:1|神戸大学:1|神戸女学院大学:1|福井大学（医学部）:1|福岡大学（医学部）:1|福島県立医科大学（医学部）:1|秋田大学:1|秋田大学（医学部）:1|群馬大学:1|茨城大学:1|関西大学:1|電気通信大学:1|高千穂大学:1|高崎経済大学:1,2025進路状況（学部合算）
14,2025,kaisei,開成高等学校,https://kaiseigakuen.jp/,荒川区,私立,男子校,0,0,0,0,早稲田大学:257|慶應義塾大学:172|東京大学:150|東京理科大学:57|上智大学:41|明治大学:38|日本医科大学（医学部）:24|防衛医科大学校（医学部）:24|千葉大学（医学部）:21|一橋大学:18|順天堂大学（医学部）:18|慶應義塾大学（医学部）:17|東京慈恵会医科大学（医学部）:17|国際医療福祉大学（医学部）:14|中央大学:13|東京科学大学（医学部）:13|京都大学:11|東京科学大学:9|北海道大学:8|法政大学:8|山梨大学（医学部）:7|日本大学:7|立教大学:6|横浜国立大学:5|東京医科大学（医学部）:4|東北大学:4|同志社大学:3|富山大学（医学部）:3|帝京大学（医学部）:3|東洋大学:3|気象大学校:3|立命館大学:3|群馬大学（医学部）:3|青山学院大学:3|信州大学（医学部）:2|専修大学:2|新潟大学（医学部）:2|日本大学（医学部）:2|昭和大学（医学部）:2|東京都市大学:2|東邦大学（医学部）:2|武蔵野美術大学:2|神奈川大学:2|筑波大学:2|芝浦工業大学:2|駒澤大学:2|ZEN大学:1|デジタルハリウッド大学:1|九州大学:1|九州大学（医学部）:1|京都外国語大学:1|京都大学（医学部）:1|京都市立芸術大学:1|北里大学:1|千葉大学:1|千葉工業大学:1|名古屋大学:1|名古屋大学（医学部）:1|埼玉大学:1|大阪大学:1|学習院大学:1|山形大学（医学部）:1|岩手医科大学（医学部）:1|島根大学（医学部）:1|明治学院大学:1|東京学芸大学:1|東京歯科大学:1|東京薬科大学:1|東京農工大学:1|東北医科薬科大学（医学部）:1|東北大学（医学部）:1|武蔵大学:1|海外:Columbia:1|海外:Cornell:1|海外:Duke:1|海外:Imperial College London:1|海外:Iowa State:1|海外:Johns Hopkins:1|海外:McGill University:1|海外:Northeastern University:1|海外:Penn State:1|海外:UC Davis:1|海外:UC San Diego:1|海外:UC Santa Barbara:1|海外:University of British Columbia:1|海外:University of Illinois Urbana-Champaign:1|海外:University of Michigan:1|海外:University of Pennsylvania:1|海外:University of Pittsburgh:1|海外:University of Southern California:1|海外:University of Toronto:1|海外:University of Wisconsin:1|滋賀医科大学（医学部）:1|獨協医科大学（医学部）:1|筑波大学（医学部）:1|長崎大学（医学部）:1|高崎経済大学:1,2025進路状況（開成高校PDF）`;

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
        const separatorIndex = item.lastIndexOf(":");
        if (separatorIndex < 0) {
          return null;
        }
        const namePart = item.slice(0, separatorIndex);
        const countPart = item.slice(separatorIndex + 1);
        const rawName = (namePart || "").trim();
        const overseasMatch = rawName.match(/^(海外大学|海外大|海外):\s*(.+)$/u);
        const isOverseas = Boolean(overseasMatch);
        const name = (overseasMatch ? overseasMatch[2] : rawName).trim();
        const count = parseNumber(countPart);
        return { name, count, isOverseas };
      })
      .filter((item) => item && item.name);
  }

  function computeTiersFromDestinations(destinations) {
    if (!destinations || !destinations.length) {
      return null;
    }
    const totals = { S: 0, A: 0, B: 0, C: 0 };
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
    const baseName = trimmed
      .replace(/\s*(（医学部）|（医）|医学部医学科|医学部\s*医学科|医学部)$/u, "")
      .trim();
    if (!baseName) return "";
    return UNIVERSITY_ALIASES[baseName] ?? baseName;
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
