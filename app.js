const state = {
  schools: [],
  comparisonList: [],
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindLogoReload();
  populateWardOptions();
  attachListeners();
  loadSchools();
  setupComparisonBadge();
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
  elements.typeFilter = document.getElementById("typeFilter");
  elements.genderFilter = document.getElementById("genderFilter");
  elements.keywordFilter = document.getElementById("keywordFilter");
  elements.resultsCount = document.getElementById("resultsCount");
  elements.resultsList = document.getElementById("resultsList");
  elements.resetButton = document.getElementById("resetFilters");
  elements.sortSelect = document.getElementById("sortSelect");
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
  const fragment = document.createDocumentFragment();
  SchoolData.WARDS.forEach((ward) => {
    const option = document.createElement("option");
    option.value = ward;
    option.textContent = ward;
    fragment.appendChild(option);
  });
  elements.wardFilter.appendChild(fragment);
}

function attachListeners() {
  [elements.wardFilter, elements.typeFilter, elements.genderFilter].forEach(
    (select) => {
      select.addEventListener("change", updateResults);
    }
  );
  elements.keywordFilter.addEventListener("input", debounce(updateResults, 200));
  elements.sortSelect.addEventListener("change", updateResults);
  elements.resetButton.addEventListener("click", resetFilters);
}

async function loadSchools() {
  try {
    const wardSet = new Set(SchoolData.WARDS);
    state.schools = (await SchoolData.loadSchools()).filter((school) =>
      wardSet.has(school.ward)
    );
    if (!state.schools.length) {
      renderError("学校データが見つかりません。");
      return;
    }
    loadComparisonList();
    updateComparisonBadge();
    updateResults();
  } catch (error) {
    renderError("学校データを読み込めませんでした。");
  }
}

function updateResults() {
  const ward = elements.wardFilter.value;
  const type = elements.typeFilter.value;
  const gender = elements.genderFilter.value;
  const keyword = normalizeText(elements.keywordFilter.value);
  const sortMode = elements.sortSelect.value;

  let filtered = state.schools.filter((school) => {
    if (ward && school.ward !== ward) return false;
    if (type && school.type !== type) return false;
    if (gender && school.gender !== gender) return false;
    if (keyword && !normalizeText(school.name).includes(keyword)) return false;
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
      ランク内訳: S ${formatPercent(school.tiers.S)}% / A ${formatPercent(
    school.tiers.A
  )}% / B ${formatPercent(school.tiers.B)}% / C ${formatPercent(
    school.tiers.C
  )}%
    </div>
    <div class="tier-bar">
      <span class="tier-s" style="width:${safeWidth(
        school.tiers.S
      )}%"></span>
      <span class="tier-a" style="width:${safeWidth(
        school.tiers.A
      )}%"></span>
      <span class="tier-b" style="width:${safeWidth(
        school.tiers.B
      )}%"></span>
      <span class="tier-c" style="width:${safeWidth(
        school.tiers.C
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
  elements.typeFilter.value = "";
  elements.genderFilter.value = "";
  elements.keywordFilter.value = "";
  elements.sortSelect.value = "adv-desc";
  updateResults();
}

function renderError(message) {
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
    .slice(0, 3)
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
