const state = {
  schools: [],
  regions: [],
  comparisonList: [],
};

const elements = {};
const flags = {
  hasSearchUI: false,
};
const TOKYO_WARDS = [
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

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindLogoReload();
  setupComparisonBadge();
  flags.hasSearchUI = hasSearchUI();
  if (flags.hasSearchUI) {
    attachListeners();
  }
  if (
    flags.hasSearchUI ||
    elements.totalSchools ||
    elements.wardGrid ||
    hasRankingLists()
  ) {
    loadSchools();
  }
});

function setupComparisonBadge() {
  const link = document.getElementById("comparisonLink");
  const badge = document.getElementById("comparisonBadge");
  if (link && badge) {
    link.addEventListener("click", (e) => {
      if (state.comparisonList.length === 0) {
        e.preventDefault();
        alert("比較する学校を選択してください。");
      }
    });
  }
  updateComparisonBadge();
}

function cacheElements() {
  elements.wardFilter = document.getElementById("wardFilter");
  elements.typeFilters = document.querySelectorAll('input[name="typeFilter"]');
  elements.genderFilters = document.querySelectorAll('input[name="genderFilter"]');
  elements.keywordFilter = document.getElementById("keywordFilter");
  elements.scoreMinFilter = document.getElementById("scoreMinFilter");
  elements.scoreMaxFilter = document.getElementById("scoreMaxFilter");
  elements.resultsCount = document.getElementById("resultsCount");
  elements.resultsList = document.getElementById("resultsList");
  elements.resetButton = document.getElementById("resetFilters");
  elements.applyButton = document.getElementById("applyFilters");
  elements.sortSelect = document.getElementById("sortSelect");
  elements.totalSchools = document.getElementById("totalSchools");
  elements.regionFilter = document.getElementById("regionFilter");
  elements.locationFilter = document.getElementById("locationFilter");
  elements.wardGrid = document.getElementById("wardGrid");
  elements.rankingList = document.getElementById("rankingList");
  elements.rankingListOverall = document.getElementById("rankingListOverall");
  elements.rankingListBoys = document.getElementById("rankingListBoys");
  elements.rankingListGirls = document.getElementById("rankingListGirls");
  elements.rankingListCoed = document.getElementById("rankingListCoed");
  elements.toggleButton = document.getElementById("toggleSearchForm");
  elements.detailedSearchForm = document.querySelector(".detailed-search-form");
}

function hasRankingLists() {
  return Boolean(
    elements.rankingList ||
      elements.rankingListOverall ||
      elements.rankingListBoys ||
      elements.rankingListGirls ||
      elements.rankingListCoed
  );
}

function hasSearchUI() {
  return Boolean(
    elements.wardFilter &&
      (elements.typeFilters?.length || document.querySelectorAll('input[name="typeFilter"]').length) &&
      (elements.genderFilters?.length || document.querySelectorAll('input[name="genderFilter"]').length) &&
      elements.keywordFilter &&
      elements.scoreMinFilter &&
      elements.scoreMaxFilter &&
      elements.resultsCount &&
      elements.resultsList &&
      elements.resetButton &&
      elements.sortSelect
  );
}

function bindLogoReload() {
  const logoLink = document.querySelector(".site-header .logo");
  if (!logoLink) return;
  logoLink.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (logoLink.dataset.navigating === "true") return;
    logoLink.dataset.navigating = "true";
    logoLink.classList.add("is-reloading");
    document.body.classList.add("is-reloading");
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : 200;
    window.setTimeout(() => {
      window.location.href = "index.html";
    }, delay);
  });
}

function populateWardOptions(regions = []) {
  if (!elements.wardFilter) return;
  const fragment = document.createDocumentFragment();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "地域を選択";
  fragment.appendChild(placeholder);
  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    fragment.appendChild(option);
  });
  elements.wardFilter.innerHTML = "";
  elements.wardFilter.appendChild(fragment);
}

function getSortedRegions(schools) {
  const set = new Set();
  (schools || []).forEach((school) => {
    const region = String(school?.ward || "").trim();
    if (region) {
      set.add(region);
    }
  });
  const prefectureSlug = SchoolData?.getPrefectureSlug?.();
  if (prefectureSlug === "tokyo") {
    TOKYO_WARDS.forEach((ward) => set.add(ward));
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, "ja", { numeric: true, sensitivity: "base" })
  );
}

function renderRegionFilter(regions = []) {
  if (!elements.regionFilter) return;
  const body = elements.regionFilter.querySelector(".region-filter-body");
  if (!body) return;
  body.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "region-link region-all";
  allButton.dataset.region = "";
  allButton.textContent = "すべての地域";
  body.appendChild(allButton);

  if (!regions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "地域データがありません。";
    body.appendChild(empty);
    return;
  }

  const group = document.createElement("div");
  group.className = "region-group";

  const title = document.createElement("p");
  title.className = "region-group-title";
  title.textContent = "地域一覧";
  group.appendChild(title);

  const links = document.createElement("div");
  links.className = "region-links";
  regions.forEach((region) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "region-link";
    button.dataset.region = region;
    button.textContent = region;
    links.appendChild(button);
  });
  group.appendChild(links);
  body.appendChild(group);
}

// 地域フィルターを階層的に表示（詳細検索フォーム用）
const REGION_GROUPS = {
  "北海道地方": ["北海道"],
  "東北地方": ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  "関東地方": ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  "中部地方": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  "近畿地方": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  "中国地方": ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  "四国地方": ["徳島県", "香川県", "愛媛県", "高知県"],
  "九州地方": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  "海外": ["海外"]
};

function renderLocationFilter(regions = []) {
  if (!elements.locationFilter) return;
  elements.locationFilter.innerHTML = "";

  if (!regions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "地域データがありません。";
    elements.locationFilter.appendChild(empty);
    return;
  }

  // 東京都の区を取得
  const tokyoWardsInData = TOKYO_WARDS.filter(ward => regions.includes(ward));
  const hasTokyo = regions.includes("東京都") || tokyoWardsInData.length > 0;

  // 地域ごとにグループ化
  Object.entries(REGION_GROUPS).forEach(([regionName, prefectures]) => {
    // この地域に該当する都道府県があるかチェック（東京都の区は除外）
    const prefecturesInRegion = prefectures.filter(pref => {
      if (pref === "東京都") return hasTokyo;
      return regions.includes(pref);
    });
    
    if (prefecturesInRegion.length === 0) return;

    const regionGroup = document.createElement("div");
    regionGroup.className = "location-region-group";

    const regionTitle = document.createElement("div");
    regionTitle.className = "location-region-title";
    regionTitle.textContent = regionName;
    regionGroup.appendChild(regionTitle);

    const prefectureContainer = document.createElement("div");
    prefectureContainer.className = "location-prefectures";

    prefecturesInRegion.forEach((pref) => {
      // 東京都の場合は都道府県として表示
      if (pref === "東京都" && hasTokyo) {
        const label = document.createElement("label");
        label.className = "location-prefecture";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "wardFilter";
        checkbox.value = "東京都";

        const span = document.createElement("span");
        span.textContent = "東京都";

        label.appendChild(checkbox);
        label.appendChild(span);
        prefectureContainer.appendChild(label);
      } else if (pref !== "東京都") {
        // その他の都道府県
        const label = document.createElement("label");
        label.className = "location-prefecture";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "wardFilter";
        checkbox.value = pref;

        const span = document.createElement("span");
        span.textContent = pref;

        label.appendChild(checkbox);
        label.appendChild(span);
        prefectureContainer.appendChild(label);
      }
    });

    // 東京都の場合は、その下に23区を表示
    if (regionName === "関東地方" && hasTokyo && tokyoWardsInData.length > 0) {
      const wardsGroup = document.createElement("div");
      wardsGroup.className = "location-wards-group";

      const wardsTitle = document.createElement("div");
      wardsTitle.className = "location-wards-title";
      wardsTitle.textContent = "東京都23区";
      wardsGroup.appendChild(wardsTitle);

      const wardsContainer = document.createElement("div");
      wardsContainer.className = "location-wards";

      tokyoWardsInData.forEach((ward) => {
        const label = document.createElement("label");
        label.className = "location-ward";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "wardFilter";
        checkbox.value = ward;

        const span = document.createElement("span");
        span.textContent = ward;

        label.appendChild(checkbox);
        label.appendChild(span);
        wardsContainer.appendChild(label);
      });

      wardsGroup.appendChild(wardsContainer);
      regionGroup.appendChild(wardsGroup);
    }

    if (prefectureContainer.children.length > 0 || regionGroup.querySelector(".location-wards-group")) {
      regionGroup.appendChild(prefectureContainer);
      elements.locationFilter.appendChild(regionGroup);
    }
  });
}

function syncLocationFilterUI() {
  if (!elements.locationFilter || !elements.wardFilter) return;
  const current = elements.wardFilter.value ?? "";
  elements.locationFilter.querySelectorAll('input[name="wardFilter"]').forEach((checkbox) => {
    checkbox.checked = checkbox.value === current;
  });
}

function populateScoreOptions() {
  if (!elements.scoreMinFilter || !elements.scoreMaxFilter) return;
  // みんなの高校情報を参考に、28-78まで1刻みで選択可能にする
  const values = [];
  for (let value = 28; value <= 78; value++) {
    values.push(value);
  }
  fillSelectOptions(elements.scoreMinFilter, "下限無し", values);
  fillSelectOptions(elements.scoreMaxFilter, "上限無し", values);
}

function fillSelectOptions(select, placeholder, values) {
  const fragment = document.createDocumentFragment();
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;
  fragment.appendChild(defaultOption);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = String(value);
    fragment.appendChild(option);
  });
  select.innerHTML = "";
  select.appendChild(fragment);
}

function attachListeners() {
  if (!flags.hasSearchUI) return;
  
  // 展開/折りたたみ機能
  if (elements.toggleButton && elements.detailedSearchForm) {
    elements.toggleButton.addEventListener("click", () => {
      const isExpanded = elements.toggleButton.getAttribute("aria-expanded") === "true";
      elements.detailedSearchForm.style.display = isExpanded ? "none" : "block";
      elements.toggleButton.setAttribute("aria-expanded", !isExpanded);
      elements.toggleButton.setAttribute("aria-label", isExpanded ? "検索フォームを展開" : "検索フォームを折りたたむ");
    });
  }

  [elements.wardFilter, elements.scoreMinFilter, elements.scoreMaxFilter].forEach(
    (select) => {
      if (select) select.addEventListener("change", updateResults);
    }
  );
  
  // チェックボックス検索（新しい詳細検索フォーム用）
  const typeCheckboxes = document.querySelectorAll('input[name="typeFilter"][type="checkbox"]');
  const genderCheckboxes = document.querySelectorAll('input[name="genderFilter"][type="checkbox"]');
  if (typeCheckboxes.length > 0) {
    typeCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateResults);
    });
  } else if (elements.typeFilters?.length) {
    elements.typeFilters.forEach((radio) => {
      radio.addEventListener("change", updateResults);
    });
  }
  
  if (genderCheckboxes.length > 0) {
    genderCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateResults);
    });
  } else if (elements.genderFilters?.length) {
    elements.genderFilters.forEach((radio) => {
      radio.addEventListener("change", updateResults);
    });
  }
  
  // 地域チェックボックス
  if (elements.locationFilter) {
    elements.locationFilter.addEventListener("change", (event) => {
      if (event.target.type === "checkbox" && event.target.name === "wardFilter") {
        updateWardFilterFromCheckboxes();
        updateResults();
      }
    });
  }
  
  elements.keywordFilter.addEventListener("input", debounce(updateResults, 200));
  elements.sortSelect.addEventListener("change", updateResults);
  
  if (elements.regionFilter) {
    elements.regionFilter.addEventListener("click", (event) => {
      const button = event.target.closest("[data-region]");
      if (!button) return;
      event.preventDefault();
      const value = button.dataset.region ?? "";
      if (elements.wardFilter) {
        elements.wardFilter.value = value;
      }
      updateResults();
    });
  }
  
  if (elements.applyButton) {
    elements.applyButton.addEventListener("click", updateResults);
  }
  elements.resetButton.addEventListener("click", resetFilters);
}

async function loadSchools() {
  try {
    state.schools = await SchoolData.loadSchools();
    state.regions = getSortedRegions(state.schools);
    if (hasSearchUI()) {
      populateWardOptions(state.regions);
      renderRegionFilter(state.regions);
      renderLocationFilter(state.regions);
    }
    if (!state.schools.length) {
      if (hasSearchUI()) {
        renderError("学校データが見つかりません。");
      }
      updateTotalSchools();
      renderWardGrid();
      renderTopRanking();
      return;
    }
    loadComparisonList();
    updateComparisonBadge();
    updateTotalSchools();
    renderWardGrid();
    renderTopRanking();
    if (hasSearchUI()) {
      populateScoreOptions();
      applyQueryParams();
      updateResults();
    }
  } catch (error) {
    state.schools = [];
    state.regions = [];
    if (hasSearchUI()) {
      populateWardOptions([]);
      renderRegionFilter([]);
      renderError("学校データを読み込めませんでした。");
    }
    updateTotalSchools();
    renderWardGrid();
    renderTopRanking();
  }
}


function updateWardFilterFromCheckboxes() {
  if (!elements.wardFilter || !elements.locationFilter) return;
  const checked = Array.from(elements.locationFilter.querySelectorAll('input[name="wardFilter"]:checked'));
  if (checked.length === 0) {
    elements.wardFilter.value = "";
  } else if (checked.length === 1) {
    elements.wardFilter.value = checked[0].value;
  } else {
    // 複数選択の場合は最初の値を設定（後でフィルタリング時に複数対応）
    elements.wardFilter.value = checked[0].value;
  }
}

function updateResults() {
  const ward = elements.wardFilter.value;
  const keyword = normalizeText(elements.keywordFilter.value);
  const sortMode = elements.sortSelect.value;
  const rawMin = parseFilterNumber(elements.scoreMinFilter.value);
  const rawMax = parseFilterNumber(elements.scoreMaxFilter.value);
  let scoreMin = rawMin;
  let scoreMax = rawMax;
  if (scoreMin != null && scoreMax != null && scoreMin > scoreMax) {
    [scoreMin, scoreMax] = [scoreMax, scoreMin];
  }

  // チェックボックス検索（新しい詳細検索フォーム用）
  const typeCheckboxes = document.querySelectorAll('input[name="typeFilter"][type="checkbox"]:checked');
  const genderCheckboxes = document.querySelectorAll('input[name="genderFilter"][type="checkbox"]:checked');
  const wardCheckboxes = elements.locationFilter ? elements.locationFilter.querySelectorAll('input[name="wardFilter"]:checked') : [];
  
  const selectedTypes = typeCheckboxes.length > 0 ? Array.from(typeCheckboxes).map(cb => cb.value) : null;
  const selectedGenders = genderCheckboxes.length > 0 ? Array.from(genderCheckboxes).map(cb => cb.value) : null;
  const selectedWards = wardCheckboxes.length > 0 ? Array.from(wardCheckboxes).map(cb => cb.value) : null;
  
  // ラジオボタン検索（旧フォーム用）
  const type = getCheckedValue(elements.typeFilters);
  const gender = getCheckedValue(elements.genderFilters);

  let filtered = state.schools.filter((school) => {
    // 地域フィルター（チェックボックス優先）
    if (selectedWards && selectedWards.length > 0) {
      if (!selectedWards.includes(school.ward)) return false;
    } else if (ward && school.ward !== ward) return false;
    
    // 国公私立フィルター（チェックボックス優先）
    if (selectedTypes && selectedTypes.length > 0) {
      if (!selectedTypes.includes(school.type)) return false;
    } else if (type && school.type !== type) return false;
    
    // 男女共学フィルター（チェックボックス優先）
    if (selectedGenders && selectedGenders.length > 0) {
      if (!selectedGenders.includes(school.gender)) return false;
    } else if (gender && school.gender !== gender) return false;
    
    // 高校名フィルター
    if (keyword && !normalizeText(school.name).includes(keyword)) return false;
    
    // 偏差値範囲フィルター
    if (scoreMin != null || scoreMax != null) {
      if (!Number.isFinite(school.advScore)) return false;
      if (scoreMin != null && school.advScore < scoreMin) return false;
      if (scoreMax != null && school.advScore > scoreMax) return false;
    }
    
    return true;
  });

  filtered = sortSchools(filtered, sortMode);
  renderResults(filtered);
  syncRegionFilterUI();
  syncLocationFilterUI();
}

const nameCollator = new Intl.Collator("ja", {
  usage: "sort",
  sensitivity: "base",
  numeric: true,
  ignorePunctuation: true,
});

function sortSchools(list, sortMode) {
  const sorted = [...list];
  switch (sortMode) {
    case "adv-asc":
      return sorted.sort((a, b) => compareScore(a, b, "asc"));
    case "name-asc":
      return sorted.sort((a, b) => compareName(a, b));
    case "adv-desc":
    default:
      return sorted.sort((a, b) => compareScore(a, b, "desc"));
  }
}

function compareScore(a, b, direction) {
  const scoreA = a.advScore ?? -Infinity;
  const scoreB = b.advScore ?? -Infinity;
  return direction === "asc" ? scoreA - scoreB : scoreB - scoreA;
}

function compareName(a, b) {
  const nameA = a?.name ?? "";
  const nameB = b?.name ?? "";
  return nameCollator.compare(nameA, nameB);
}

function renderResults(items) {
  elements.resultsList.innerHTML = "";
  elements.resultsCount.textContent = `${items.length}件の学校が見つかりました`;

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "条件に一致する学校がありません。";
    elements.resultsList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((school) => fragment.appendChild(createCard(school)));
  elements.resultsList.appendChild(fragment);
}

function createCard(school) {
  const card = document.createElement("article");
  card.className = "school-card";
  const detailHref = school.slug
    ? `school.html?slug=${encodeURIComponent(school.slug)}`
    : "";
  const destinationText = formatDestinationSummary(school.destinations);
  const isInComparison = state.comparisonList.some((s) => s.slug === school.slug);
  const maxComparison = 5;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-header-main">
        <h3 class="school-name">${escapeHtml(school.name)}</h3>
        <div class="badge-row">
          <span class="badge badge-ward">${escapeHtml(school.ward)}</span>
          <span class="badge badge-type">${escapeHtml(school.type)}</span>
          <span class="badge badge-gender">${escapeHtml(school.gender)}</span>
        </div>
      </div>
      <div class="score">
        <div class="score-value">${formatScore(school.advScore)}</div>
        <div class="score-label">進学偏差値</div>
      </div>
    </div>
    <div class="card-content">
      <div class="tier-visual">
        <div class="tier-bar">
          <span class="tier-ss" style="width:${safeWidth(
            school.tiers.ss
          )}%"></span>
          <span class="tier-s" style="width:${safeWidth(
            school.tiers.s
          )}%"></span>
          <span class="tier-a" style="width:${safeWidth(
            school.tiers.a
          )}%"></span>
          <span class="tier-b" style="width:${safeWidth(
            school.tiers.b
          )}%"></span>
          <span class="tier-c" style="width:${safeWidth(
            school.tiers.c
          )}%"></span>
          <span class="tier-d" style="width:${safeWidth(
            school.tiers.d
          )}%"></span>
          <span class="tier-e" style="width:${safeWidth(
            school.tiers.e
          )}%"></span>
        </div>
        <div class="tier-summary">
          <span class="tier-item">SS ${formatPercent(school.tiers.ss)}%</span>
          <span class="tier-item">S ${formatPercent(school.tiers.s)}%</span>
          <span class="tier-item">A ${formatPercent(school.tiers.a)}%</span>
          <span class="tier-item">B ${formatPercent(school.tiers.b)}%</span>
          <span class="tier-item">C ${formatPercent(school.tiers.c)}%</span>
          <span class="tier-item">D ${formatPercent(school.tiers.d)}%</span>
          <span class="tier-item">E ${formatPercent(school.tiers.e)}%</span>
        </div>
      </div>
      <div class="destination">
        <strong class="destination-label">主な合格先</strong>
        <span class="destination-summary">${destinationText}</span>
      </div>
    </div>
    <div class="card-actions">
      ${
        detailHref
          ? `<a class="detail-link" href="${detailHref}">詳細を見る</a>`
          : ""
      }
      <button 
        class="comparison-button ${isInComparison ? "is-active" : ""}" 
        data-school-slug="${school.slug || ""}"
        ${isInComparison ? "" : state.comparisonList.length >= maxComparison ? "disabled" : ""}
        title="${isInComparison ? "比較から削除" : state.comparisonList.length >= maxComparison ? `比較は最大${maxComparison}校まで` : "比較に追加"}"
      >
        ${isInComparison ? "✓ 比較中" : "比較に追加"}
      </button>
    </div>
  `;

  const comparisonButton = card.querySelector(".comparison-button");
  if (comparisonButton) {
    comparisonButton.addEventListener("click", (e) => {
      e.preventDefault();
      toggleComparison(school);
    });
  }

  return card;
}

function toggleComparison(school) {
  const index = state.comparisonList.findIndex((s) => s.slug === school.slug);
  if (index >= 0) {
    state.comparisonList.splice(index, 1);
  } else {
    if (state.comparisonList.length >= 5) {
      return;
    }
    state.comparisonList.push(school);
  }
  saveComparisonList();
  updateComparisonBadge();
  updateResults();
}

function saveComparisonList() {
  try {
    const data = state.comparisonList.map((s) => s.slug);
    localStorage.setItem("comparisonList", JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save comparison list", e);
  }
}

function loadComparisonList() {
  try {
    const data = localStorage.getItem("comparisonList");
    if (!data) return;
    const slugs = JSON.parse(data);
    state.comparisonList = state.schools.filter((s) => slugs.includes(s.slug));
  } catch (e) {
    console.error("Failed to load comparison list", e);
  }
}

function updateComparisonBadge() {
  const badge = document.getElementById("comparisonBadge");
  if (badge) {
    const count = state.comparisonList.length;
    badge.textContent = count > 0 ? `比較 (${count})` : "比較";
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }
}

function resetFilters() {
  elements.wardFilter.value = "";
  setRadioValue(elements.typeFilters, "");
  setRadioValue(elements.genderFilters, "");
  elements.keywordFilter.value = "";
  elements.scoreMinFilter.value = "";
  elements.scoreMaxFilter.value = "";
  elements.sortSelect.value = getDefaultSortValue();
  
  // チェックボックスをリセット
  document.querySelectorAll('input[name="typeFilter"][type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="genderFilter"][type="checkbox"]').forEach(cb => cb.checked = false);
  if (elements.locationFilter) {
    elements.locationFilter.querySelectorAll('input[name="wardFilter"]').forEach(cb => cb.checked = false);
  }
  
  updateResults();
}

function syncRegionFilterUI() {
  if (!elements.regionFilter || !elements.wardFilter) return;
  const current = elements.wardFilter.value ?? "";
  elements.regionFilter.querySelectorAll("[data-region]").forEach((button) => {
    const isActive = button.dataset.region === current;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function renderError(message) {
  if (!elements.resultsList || !elements.resultsCount) return;
  elements.resultsList.innerHTML = "";
  elements.resultsCount.textContent = "データを読み込めませんでした";
  const error = document.createElement("div");
  error.className = "empty-state";
  error.textContent = message;
  elements.resultsList.appendChild(error);
}

function formatScore(value) {
  return value == null ? "-" : value.toFixed(1);
}

function formatPercent(value) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

function safeWidth(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatDestinationSummary(destinations) {
  if (!destinations || !destinations.length) {
    return "-";
  }
  // 合格者数でソートしてTOP5まで表示（残りはetc...）
  const sorted = [...destinations].sort((a, b) => (b.count || 0) - (a.count || 0));
  const topFive = sorted.slice(0, 5);
  const summary = topFive
    .map((item) => `${escapeHtml(item.name)} ${formatCount(item.count)}名`)
    .join(" / ");
  if (sorted.length > 5) {
    return `${summary} / etc...`;
  }
  return summary;
}

function formatCount(value) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function debounce(fn, wait) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getDefaultSortValue() {
  if (!elements.sortSelect) return "adv-desc";
  return (
    elements.sortSelect.dataset.default ||
    elements.sortSelect.querySelector("option[selected]")?.value ||
    elements.sortSelect.value ||
    "adv-desc"
  );
}

function applyQueryParams() {
  if (!hasSearchUI()) return;
  const params = new URLSearchParams(window.location.search);
  if (!params.size) return;
  setSelectValue(elements.wardFilter, params.get("ward"));
  setRadioValue(elements.typeFilters, params.get("type"));
  setRadioValue(elements.genderFilters, params.get("gender"));
  setSelectValue(elements.scoreMinFilter, params.get("scoreMin"));
  setSelectValue(elements.scoreMaxFilter, params.get("scoreMax"));
  const keyword = params.get("keyword");
  if (keyword && elements.keywordFilter) {
    elements.keywordFilter.value = keyword;
  }
  setSelectValue(elements.sortSelect, params.get("sort"));
}

function setSelectValue(select, value) {
  if (!select || value == null || value === "") return false;
  const found = Array.from(select.options).some((option) => option.value === value);
  if (found) {
    select.value = value;
  }
  return found;
}

function setRadioValue(nodeList, value) {
  if (!nodeList || !nodeList.length) return false;
  const targetValue = value ?? "";
  let found = false;
  nodeList.forEach((input) => {
    if (input.value === targetValue) {
      input.checked = true;
      found = true;
    }
  });
  return found;
}

function getCheckedValue(nodeList) {
  if (!nodeList || !nodeList.length) return "";
  const checked = Array.from(nodeList).find((input) => input.checked);
  return checked ? checked.value : "";
}

function parseFilterNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function updateTotalSchools() {
  if (!elements.totalSchools) return;
  const count = Number.isFinite(state.schools.length) ? state.schools.length : 0;
  elements.totalSchools.textContent = count ? count.toLocaleString("ja-JP") : "-";
}

function renderWardGrid() {
  if (!elements.wardGrid) return;
  elements.wardGrid.innerHTML = "";
  const counts = countSchoolsByWard(state.schools);
  const regions = state.regions.length
    ? state.regions
    : getSortedRegions(state.schools);
  if (!regions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "地域データがありません。";
    elements.wardGrid.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  regions.forEach((ward) => {
    const link = document.createElement("a");
    link.className = "ward-card";
    link.href = `search.html?ward=${encodeURIComponent(ward)}`;

    const name = document.createElement("span");
    name.className = "ward-name";
    name.textContent = ward;

    const count = document.createElement("span");
    count.className = "ward-count";
    const wardCount = counts.get(ward) ?? 0;
    count.textContent = wardCount ? `${wardCount}校` : "—";

    link.appendChild(name);
    link.appendChild(count);
    fragment.appendChild(link);
  });
  elements.wardGrid.appendChild(fragment);
}

function countSchoolsByWard(schools) {
  const counts = new Map();
  schools.forEach((school) => {
    if (!school?.ward) return;
    counts.set(school.ward, (counts.get(school.ward) ?? 0) + 1);
  });
  return counts;
}

function renderTopRanking(limit = 5) {
  const targets = getRankingTargets();
  if (!targets.length) return;
  const emptyMessage = "ランキングのデータがありません。";
  if (!state.schools.length) {
    targets.forEach(({ element }) => renderRankingList([], element, emptyMessage));
    return;
  }
  targets.forEach(({ element, gender }) => {
    const filtered = gender
      ? state.schools.filter((school) => school.gender === gender)
      : state.schools;
    const ranked = sortSchools(filtered, "adv-desc").slice(0, limit);
    renderRankingList(ranked, element, emptyMessage);
  });
}

function getRankingTargets() {
  if (
    elements.rankingListOverall ||
    elements.rankingListBoys ||
    elements.rankingListGirls ||
    elements.rankingListCoed
  ) {
    const targets = [];
    if (elements.rankingListOverall) {
      targets.push({ element: elements.rankingListOverall, gender: "" });
    }
    if (elements.rankingListBoys) {
      targets.push({ element: elements.rankingListBoys, gender: "男子校" });
    }
    if (elements.rankingListGirls) {
      targets.push({ element: elements.rankingListGirls, gender: "女子校" });
    }
    if (elements.rankingListCoed) {
      targets.push({ element: elements.rankingListCoed, gender: "共学" });
    }
    return targets;
  }
  return elements.rankingList ? [{ element: elements.rankingList, gender: "" }] : [];
}

function renderRankingList(items, target, emptyMessage) {
  if (!target) return;
  target.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyMessage || "ランキングのデータがありません。";
    target.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((school, index) => {
    fragment.appendChild(createRankCard(school, index + 1));
  });
  target.appendChild(fragment);
}

function createRankCard(school, rank) {
  const detailHref = school.slug
    ? `school.html?slug=${encodeURIComponent(school.slug)}`
    : "";
  const card = document.createElement(detailHref ? "a" : "article");
  card.className = "rank-card";
  if (detailHref) {
    card.href = detailHref;
    card.setAttribute("aria-label", `${school.name}の詳細を見る`);
  }

  // ランクバッジのスタイル（1-3位は特別な色）
  const rankClass = rank <= 3 ? `rank-badge rank-${rank}` : "rank-badge";

  card.innerHTML = `
    <div class="${rankClass}">${rank}</div>
    <div class="rank-info">
      <h3 class="school-name">${escapeHtml(school.name)}</h3>
      <div class="rank-score">${formatScore(school.advScore)}</div>
    </div>
  `;

  return card;
}
