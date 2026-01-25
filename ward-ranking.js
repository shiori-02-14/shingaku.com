const state = {
  schools: [],
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindLogoReload();
  populateWardOptions();
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
  SchoolData.WARDS.forEach((ward) => {
    const option = document.createElement("option");
    option.value = ward;
    option.textContent = ward;
    fragment.appendChild(option);
  });
  elements.wardSelect.appendChild(fragment);
}

function attachListeners() {
  elements.wardSelect.addEventListener("change", updateRanking);
  elements.genderSelect.addEventListener("change", updateRanking);
}

async function loadSchools() {
  try {
    state.schools = await SchoolData.loadSchools();
    updateRanking();
  } catch (error) {
    renderMessage("ランキングを読み込めませんでした。");
  }
}

function updateRanking() {
  const ward = elements.wardSelect.value;
  const gender = elements.genderSelect.value;
  if (!ward) {
    elements.rankingCount.textContent = "区を選択してください";
    renderMessage("区を選ぶとランキングが表示されます。");
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
  const card = document.createElement("article");
  card.className = "rank-card";
  const detailHref = school.id
    ? `school.html?id=${encodeURIComponent(school.id)}`
    : school.slug
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
