const state = {
  schools: [],
  regions: [],
};

const elements = {};
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
  attachListeners();
  loadSchools();
});

function cacheElements() {
  elements.wardSelect = document.getElementById("wardSelect");
  elements.genderSelect = document.getElementById("genderSelect");
  elements.rankingCount = document.getElementById("rankingCount");
  elements.rankingList = document.getElementById("rankingList");
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
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "選択してください";
  fragment.appendChild(placeholder);
  state.regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    fragment.appendChild(option);
  });
  elements.wardSelect.innerHTML = "";
  elements.wardSelect.appendChild(fragment);
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

function attachListeners() {
  elements.wardSelect.addEventListener("change", updateRanking);
  elements.genderSelect.addEventListener("change", updateRanking);
}

async function loadSchools() {
  try {
    state.schools = await SchoolData.loadSchools();
    state.regions = getSortedRegions(state.schools);
    populateWardOptions();
    updateRanking();
  } catch (error) {
    renderMessage("ランキングを読み込めませんでした。");
  }
}

function updateRanking() {
  const ward = elements.wardSelect.value;
  const gender = elements.genderSelect.value;
  if (!ward) {
    elements.rankingCount.textContent = "地域を選択してください";
    renderMessage("地域を選ぶとランキングが表示されます。");
    return;
  }

  const ranked = state.schools
    .filter((school) => school.ward === ward)
    .filter((school) => (gender ? school.gender === gender : true))
    .sort((a, b) => compareScore(a, b));

  const genderLabel = gender ? `・${gender}` : "";
  elements.rankingCount.textContent = `${ward}${genderLabel}の学校 ${ranked.length}件`;
  renderRanking(ranked);
}

function renderRanking(items) {
  elements.rankingList.innerHTML = "";
  if (!items.length) {
    renderMessage("該当する学校がありません。");
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((school, index) => {
    fragment.appendChild(createRankCard(school, index + 1));
  });
  elements.rankingList.appendChild(fragment);
}

function createRankCard(school, rank) {
  const detailHref = school.slug
    ? `school.html?slug=${encodeURIComponent(school.slug)}`
    : "";

  // 1位〜3位には特別なクラスを付与
  const rankClass = rank <= 3 ? `rank-badge rank-${rank}` : "rank-badge";

  const card = document.createElement(detailHref ? "a" : "article");
  card.className = "rank-card";
  if (detailHref) {
    card.href = detailHref;
    card.setAttribute("aria-label", `${school.name}の詳細を見る`);
  }

  const destinationText = formatDestinationSummary(school.destinations);

  card.innerHTML = `
    <div class="${rankClass}">${rank}</div>
    <div class="rank-info">
      <div class="rank-header">
        <h3 class="school-name">${escapeHtml(school.name)}</h3>
        <div class="rank-meta">
          <span class="badge badge-ward">${escapeHtml(school.ward)}</span>
          <span class="badge badge-type">${escapeHtml(school.type)}</span>
          <span class="badge badge-gender">${escapeHtml(school.gender)}</span>
        </div>
      </div>
      
      <div class="rank-content">
        <div class="rank-score-container">
          <div class="score-value">${formatScore(school.advScore)}</div>
          <div class="score-label">進学偏差値</div>
        </div>
        
        <div class="tier-visual">
          <div class="tier-bar">
            <span class="tier-ss" style="width:${safeWidth(school.tiers.ss)}%"></span>
            <span class="tier-s" style="width:${safeWidth(school.tiers.s)}%"></span>
            <span class="tier-a" style="width:${safeWidth(school.tiers.a)}%"></span>
            <span class="tier-b" style="width:${safeWidth(school.tiers.b)}%"></span>
            <span class="tier-c" style="width:${safeWidth(school.tiers.c)}%"></span>
            <span class="tier-d" style="width:${safeWidth(school.tiers.d)}%"></span>
            <span class="tier-e" style="width:${safeWidth(school.tiers.e)}%"></span>
          </div>
        </div>
      </div>

      <div class="destination">
        <strong class="destination-label">主な合格先:</strong>
        <span class="destination-summary">${destinationText}</span>
      </div>
    </div>
  `;

  return card;
}

function renderMessage(message) {
  elements.rankingList.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  elements.rankingList.appendChild(empty);
}

function compareScore(a, b) {
  const scoreA = a.advScore ?? -Infinity;
  const scoreB = b.advScore ?? -Infinity;
  return scoreB - scoreA;
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

function formatCount(value) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function formatDestinationSummary(destinations) {
  if (!destinations || !destinations.length) {
    return "-";
  }
  // 合格者数でソートしてTOP5まで表示
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
