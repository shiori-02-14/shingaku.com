const state = {
  schools: [],
  comparisonList: [],
};

const elements = {};
const flags = {
  hasSearchUI: false,
};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindLogoReload();
  setupComparisonBadge();
  flags.hasSearchUI = hasSearchUI();
  if (flags.hasSearchUI) {
    populateWardOptions();
    attachListeners();
  }
  if (flags.hasSearchUI || elements.totalSchools || elements.wardGrid || elements.rankingList) {
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
  elements.wardGrid = document.getElementById("wardGrid");
  elements.rankingList = document.getElementById("rankingList");
}

function hasSearchUI() {
  return Boolean(
    elements.wardFilter &&
      elements.typeFilters?.length &&
      elements.genderFilters?.length &&
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

function populateWardOptions() {
  if (!elements.wardFilter) return;
  const fragment = document.createDocumentFragment();
  SchoolData.WARDS.forEach((ward) => {
    const option = document.createElement("option");
    option.value = ward;
    option.textContent = ward;
    fragment.appendChild(option);
  });
  elements.wardFilter.appendChild(fragment);
}

function populateScoreOptions() {
  if (!elements.scoreMinFilter || !elements.scoreMaxFilter) return;
  const scores = state.schools
    .map((school) => school.advScore)
    .filter((score) => Number.isFinite(score));
  if (!scores.length) return;
  const stats = scores.reduce(
    (acc, score) => {
      acc.min = Math.min(acc.min, score);
      acc.max = Math.max(acc.max, score);
      return acc;
    },
    { min: Infinity, max: -Infinity }
  );
  if (!Number.isFinite(stats.min) || !Number.isFinite(stats.max)) return;
  const minScore = Math.floor(stats.min / 5) * 5;
  const maxScore = Math.ceil(stats.max / 5) * 5;
  const values = [];
  for (let value = minScore; value <= maxScore; value += 5) {
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
  [elements.wardFilter, elements.scoreMinFilter, elements.scoreMaxFilter].forEach(
    (select) => {
      select.addEventListener("change", updateResults);
    }
  );
  elements.typeFilters.forEach((radio) => {
    radio.addEventListener("change", updateResults);
  });
  elements.genderFilters.forEach((radio) => {
    radio.addEventListener("change", updateResults);
  });
  elements.keywordFilter.addEventListener("input", debounce(updateResults, 200));
  elements.sortSelect.addEventListener("change", updateResults);
  if (elements.applyButton) {
    elements.applyButton.addEventListener("click", updateResults);
  }
  elements.resetButton.addEventListener("click", resetFilters);
}

async function loadSchools() {
  try {
    const wardSet = new Set(SchoolData.WARDS);
    state.schools = (await SchoolData.loadSchools()).filter((school) =>
      wardSet.has(school.ward)
    );
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
    if (hasSearchUI()) {
      renderError("学校データを読み込めませんでした。");
    }
    updateTotalSchools();
    renderWardGrid();
    renderTopRanking();
  }
}

function updateResults() {
  const ward = elements.wardFilter.value;
  const type = getCheckedValue(elements.typeFilters);
  const gender = getCheckedValue(elements.genderFilters);
  const keyword = normalizeText(elements.keywordFilter.value);
  const sortMode = elements.sortSelect.value;
  const rawMin = parseFilterNumber(elements.scoreMinFilter.value);
  const rawMax = parseFilterNumber(elements.scoreMaxFilter.value);
  let scoreMin = rawMin;
  let scoreMax = rawMax;
  if (scoreMin != null && scoreMax != null && scoreMin > scoreMax) {
    [scoreMin, scoreMax] = [scoreMax, scoreMin];
  }

  let filtered = state.schools.filter((school) => {
    if (ward && school.ward !== ward) return false;
    if (type && school.type !== type) return false;
    if (gender && school.gender !== gender) return false;
    if (keyword && !normalizeText(school.name).includes(keyword)) return false;
    if (scoreMin != null || scoreMax != null) {
      if (!Number.isFinite(school.advScore)) return false;
      if (scoreMin != null && school.advScore < scoreMin) return false;
      if (scoreMax != null && school.advScore > scoreMax) return false;
    }
    return true;
  });

  filtered = sortSchools(filtered, sortMode);
  renderResults(filtered);
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
      <div>
        <h3 class="school-name">${escapeHtml(school.name)}</h3>
        <div class="badge-row">
          <span class="badge">${escapeHtml(school.ward)}</span>
          <span class="badge">${escapeHtml(school.type)}</span>
          <span class="badge">${escapeHtml(school.gender)}</span>
        </div>
      </div>
      <div class="score">
        <div class="score-value">${formatScore(school.advScore)}</div>
        <div class="score-label">進学偏差値</div>
      </div>
    </div>
    <div class="tier-line">
      ランク内訳: ss ${formatPercent(school.tiers.ss)}% / s ${formatPercent(
    school.tiers.s
  )}% / a ${formatPercent(school.tiers.a)}% / b ${formatPercent(
    school.tiers.b
  )}% / c ${formatPercent(school.tiers.c)}% / d ${formatPercent(
    school.tiers.d
  )}% / e ${formatPercent(school.tiers.e)}%
    </div>
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
    <div class="destination">
      <strong>主な合格先</strong>
      <span class="destination-summary">${destinationText}</span>
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
  updateResults();
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
  return destinations
    .map((item) => `${escapeHtml(item.name)} ${formatCount(item.count)}名`)
    .join(" / ");
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
  const fragment = document.createDocumentFragment();
  SchoolData.WARDS.forEach((ward) => {
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
  if (!elements.rankingList) return;
  elements.rankingList.innerHTML = "";
  if (!state.schools.length) {
    renderRankingMessage("ランキングのデータがありません。");
    return;
  }

  const ranked = sortSchools(state.schools, "adv-desc").slice(0, limit);
  if (!ranked.length) {
    renderRankingMessage("ランキングのデータがありません。");
    return;
  }

  const fragment = document.createDocumentFragment();
  ranked.forEach((school, index) => {
    fragment.appendChild(createRankCard(school, index + 1));
  });
  elements.rankingList.appendChild(fragment);
}

function renderRankingMessage(message) {
  if (!elements.rankingList) return;
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  elements.rankingList.appendChild(empty);
}

function createRankCard(school, rank) {
  const card = document.createElement("article");
  card.className = "rank-card";
  const detailHref = school.slug
    ? `school.html?slug=${encodeURIComponent(school.slug)}`
    : "";

  card.innerHTML = `
    <div class="rank-badge">${rank}</div>
    <div class="rank-info">
      <h3 class="school-name">
        ${
          detailHref
            ? `<a href="${detailHref}">${escapeHtml(school.name)}</a>`
            : escapeHtml(school.name)
        }
      </h3>
      <div class="rank-meta">
        <span>${escapeHtml(school.ward)}</span>
        <span>${escapeHtml(school.type)}</span>
        <span>${escapeHtml(school.gender)}</span>
      </div>
    </div>
    <div class="score">
      <div class="score-value">${formatScore(school.advScore)}</div>
      <div class="score-label">進学偏差値</div>
    </div>
  `;

  return card;
}
