const elements = {};
let currentSchool = null;
let chartInstances = {
  destinations: null,
  tier: null,
  trend: null,
};
const NO_DATA_MESSAGE = "データがないため、更新をお待ちください。";
const EXTRA_YEAR_RANGE = 3;

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindLogoReload();
  loadDetail();
});

function getSchoolIdentifier() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || params.get("schoolId");
  const slug = params.get("slug");
  const bodyId = document.body?.dataset?.schoolId;
  return { id, slug, bodyId };
}

function findSchoolByIdentifier(schools, { id, slug, bodyId }) {
  if (!schools || !schools.length) return null;
  const idValue = String(id || bodyId || "").trim();
  const slugValue = String(slug || "").trim();

  if (idValue) {
    const matchById = schools.find((item) => String(item.id) === idValue);
    if (matchById) return matchById;
  }

  if (slugValue) {
    const matchBySlug = schools.find((item) => String(item.slug) === slugValue);
    if (matchBySlug) return matchBySlug;
  }

  if (idValue) {
    return schools.find((item) => String(item.slug) === idValue) ?? null;
  }

  return null;
}

function cacheElements() {
  elements.name = document.getElementById("schoolName");
  elements.badges = document.getElementById("schoolBadges");
  elements.yearSelect = document.getElementById("yearSelect");
  elements.website = document.getElementById("schoolWebsite");
  elements.scoreValue = document.getElementById("scoreValue");
  elements.tierLine = document.getElementById("tierLine");
  elements.tierBar = document.getElementById("tierBar");
  elements.destinationsList = document.getElementById("destinationsList");
  elements.destinationsOverseasSection = document.getElementById(
    "destinationsOverseasSection"
  );
  elements.destinationsOverseasList = document.getElementById(
    "destinationsOverseasList"
  );
  elements.destinationsTotal = document.getElementById("destinationsTotal");
  elements.detailRoot = document.getElementById("detailRoot");
  elements.destinationsChart = document.getElementById("destinationsChart");
  elements.tierChart = document.getElementById("tierChart");
  elements.trendChart = document.getElementById("trendChart");
  elements.trendCard = document.getElementById("trendCard");
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

async function loadDetail() {
  const identifier = getSchoolIdentifier();
  if (!identifier.id && !identifier.slug && !identifier.bodyId) {
    renderNotFound("学校が指定されていません。");
    return;
  }

  try {
    const schools = await SchoolData.loadSchools();
    const school = findSchoolByIdentifier(schools, identifier);
    if (!school) {
      renderNotFound("該当する学校が見つかりませんでした。");
      return;
    }
    currentSchool = school;
    const defaultYear = getDefaultYear(school);
    setupYearSelect(school, defaultYear);
    renderDetail(school, defaultYear);
  } catch (error) {
    renderNotFound("学校データを読み込めませんでした。");
  }
}

function renderDetail(school, year) {
  const yearData = getYearData(school, year);
  if (!yearData) {
    renderNotFound("学校データを読み込めませんでした。");
    return;
  }
  const isAvailable = yearData.isAvailable !== false;
  const yearLabel = formatYearLabel(yearData.year);
  const tiers = yearData.tiers ?? { S: 0, A: 0, B: 0, C: 0 };
  renderSchoolName(school);
  elements.scoreValue.textContent = formatScore(yearData.advScore);
  if (isAvailable) {
    elements.tierLine.textContent = `${yearLabel ? `${yearLabel} ` : ""}ランク内訳: S ${formatPercent(
      tiers.S
    )}% / A ${formatPercent(tiers.A)}% / B ${formatPercent(
      tiers.B
    )}% / C ${formatPercent(tiers.C)}%`;
  } else {
    const prefix = yearLabel ? `${yearLabel} ` : "";
    elements.tierLine.textContent = `${prefix}${NO_DATA_MESSAGE}`;
  }
  if (elements.yearSelect && yearData.year != null) {
    elements.yearSelect.value = String(yearData.year);
  }

  renderBadges(school);
  renderWebsite(school);
  renderTierBar(isAvailable ? tiers : null);
  renderDestinations(yearData.destinations, yearLabel, isAvailable);
  renderCharts(yearData, school);
}

function setupYearSelect(school, defaultYear) {
  if (!elements.yearSelect) return;
  const years = getSelectableYears(school);
  elements.yearSelect.innerHTML = "";
  if (!years.length) {
    elements.yearSelect.disabled = true;
    return;
  }
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = `${year}年度`;
    elements.yearSelect.appendChild(option);
  });
  if (defaultYear != null) {
    elements.yearSelect.value = String(defaultYear);
  }
  elements.yearSelect.disabled = years.length <= 1;
  elements.yearSelect.onchange = () => {
    if (!currentSchool) return;
    const selected = parseYearValue(elements.yearSelect.value);
    renderDetail(currentSchool, selected);
  };
}

function getAvailableYears(school) {
  if (!school || !school.years) return [];
  const years = school.years
    .map((item) => item.year)
    .filter((year) => Number.isFinite(year));
  return Array.from(new Set(years)).sort((a, b) => b - a);
}

function getSelectableYears(school) {
  const available = getAvailableYears(school);
  const currentYear = new Date().getFullYear();
  const baseCandidates = [...available];
  if (Number.isFinite(currentYear)) {
    baseCandidates.push(currentYear);
  }
  const baseYear = baseCandidates.length ? Math.max(...baseCandidates) : null;
  const rangeYears = [];
  if (Number.isFinite(baseYear)) {
    for (let offset = 0; offset <= EXTRA_YEAR_RANGE; offset += 1) {
      rangeYears.push(baseYear - offset);
    }
  }
  return Array.from(new Set([...available, ...rangeYears]))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
}

function getDefaultYear(school) {
  const years = getAvailableYears(school);
  if (years.length) return years[0];
  const currentYear = new Date().getFullYear();
  return Number.isFinite(currentYear) ? currentYear : school?.latestYear ?? null;
}

function getYearData(school, year) {
  if (!school) return null;
  const hasYears = Array.isArray(school.years) && school.years.length > 0;
  if (year != null && hasYears) {
    const match = school.years.find(
      (item) => Number(item.year) === Number(year)
    );
    if (match) {
      return { ...match, isAvailable: true };
    }
    return buildMissingYearData(year);
  }
  if (hasYears) {
    return { ...school.years[0], isAvailable: true };
  }
  const fallbackYear =
    year != null
      ? Number(year)
      : Number.isFinite(school?.latestYear)
      ? Number(school.latestYear)
      : null;
  return buildMissingYearData(fallbackYear);
}

function buildMissingYearData(year) {
  return {
    year: Number.isFinite(year) ? Number(year) : null,
    tiers: { S: 0, A: 0, B: 0, C: 0 },
    advScore: null,
    destinations: [],
    notes: "",
    isAvailable: false,
  };
}

function renderBadges(school) {
  elements.badges.innerHTML = "";
  const badges = [school.ward, school.type, school.gender];
  badges.forEach((text) => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = text;
    elements.badges.appendChild(span);
  });
}

function renderSchoolName(school) {
  if (!elements.name) return;
  elements.name.innerHTML = "";
  const nameText = school?.name ?? "";
  if (school?.websiteUrl) {
    const link = document.createElement("a");
    link.className = "school-name-link";
    link.href = school.websiteUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = nameText;
    elements.name.appendChild(link);
    return;
  }
  elements.name.textContent = nameText;
}

function renderWebsite(school) {
  if (!elements.website) return;
  const container = elements.website.parentElement;
  if (!school?.websiteUrl) {
    elements.website.style.display = "none";
    elements.website.removeAttribute("href");
    if (container) {
      container.style.display = "none";
    }
    return;
  }
  if (container) {
    container.style.display = "";
  }
  elements.website.style.display = "";
  elements.website.href = school.websiteUrl;
}

function renderTierBar(tiers) {
  const spans = elements.tierBar.querySelectorAll("span");
  if (spans.length < 4) return;
  const safeTiers = tiers ?? { S: 0, A: 0, B: 0, C: 0 };
  spans[0].style.width = `${safeWidth(safeTiers.S)}%`;
  spans[1].style.width = `${safeWidth(safeTiers.A)}%`;
  spans[2].style.width = `${safeWidth(safeTiers.B)}%`;
  spans[3].style.width = `${safeWidth(safeTiers.C)}%`;
}

function renderDestinations(destinations, yearLabel, isAvailable = true) {
  elements.destinationsList.innerHTML = "";
  if (elements.destinationsOverseasList) {
    elements.destinationsOverseasList.innerHTML = "";
  }
  if (elements.destinationsOverseasSection) {
    elements.destinationsOverseasSection.style.display = "none";
  }
  const prefix = yearLabel ? `${yearLabel} ` : "";
  if (!isAvailable) {
    elements.destinationsTotal.textContent = `${prefix}${NO_DATA_MESSAGE}`;
    return;
  }
  if (!destinations || !destinations.length) {
    elements.destinationsTotal.textContent = `${prefix}進学先データがありません。`;
    return;
  }

  const domestic = destinations.filter((item) => !item.isOverseas);
  const overseas = destinations.filter((item) => item.isOverseas);
  const domesticTotal = domestic.reduce((sum, item) => sum + item.count, 0);
  const overseasTotal = overseas.reduce((sum, item) => sum + item.count, 0);
  const total = domesticTotal + overseasTotal;
  const overseasNote = overseasTotal ? `（海外 ${overseasTotal}名）` : "";
  elements.destinationsTotal.textContent = `${prefix}合計 ${total}名${overseasNote}`;

  renderDestinationList(domestic, domesticTotal, elements.destinationsList);

  if (
    overseas.length &&
    elements.destinationsOverseasSection &&
    elements.destinationsOverseasList
  ) {
    elements.destinationsOverseasSection.style.display = "";
    renderDestinationList(
      overseas,
      overseasTotal,
      elements.destinationsOverseasList
    );
  }
}

function renderDestinationList(items, total, target) {
  if (!target) return;
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "destination-item";
    const ratio = total ? Math.round((item.count / total) * 100) : 0;
    li.innerHTML = `
      <span>${escapeHtml(item.name)}</span>
      <span>${formatCount(item.count)}名${total ? ` (${ratio}%)` : ""}</span>
    `;
    fragment.appendChild(li);
  });
  target.appendChild(fragment);
}

function renderNotFound(message) {
  elements.detailRoot.innerHTML = `
    <section class="detail-body">
      <div class="container">
        <div class="empty-state">${message}</div>
      </div>
    </section>
  `;
}

function formatScore(value) {
  return value == null ? "-" : value.toFixed(1);
}

function formatPercent(value) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

function formatYearLabel(year) {
  return Number.isFinite(year) ? `${year}年度` : "";
}

function safeWidth(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatCount(value) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function parseYearValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCharts(yearData, school) {
  if (typeof Chart === "undefined") {
    return;
  }
  const isAvailable = yearData?.isAvailable !== false;
  if (isAvailable) {
    renderDestinationsChart(yearData.destinations);
    renderTierChart(yearData.tiers);
  } else {
    clearYearCharts();
  }
  renderTrendChart(school);
}

function clearYearCharts() {
  destroyChart("destinations");
  destroyChart("tier");
  clearCanvas(elements.destinationsChart);
  clearCanvas(elements.tierChart);
}

function destroyChart(key) {
  if (!chartInstances[key]) return;
  chartInstances[key].destroy();
  chartInstances[key] = null;
}

function clearCanvas(canvas) {
  if (!canvas) return;
  const context = canvas.getContext?.("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function renderDestinationsChart(destinations) {
  if (!elements.destinationsChart) {
    return;
  }
  const filtered = destinations?.filter((item) => !item.isOverseas) ?? [];
  if (!filtered.length) {
    destroyChart("destinations");
    clearCanvas(elements.destinationsChart);
    return;
  }

  if (chartInstances.destinations) {
    chartInstances.destinations.destroy();
  }

  const sorted = [...filtered]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const labels = sorted.map((item) => escapeHtml(item.name));
  const data = sorted.map((item) => item.count);

  chartInstances.destinations = new Chart(elements.destinationsChart, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "進学者数",
          data: data,
          backgroundColor: "#4a7bd1",
          borderColor: "#1b4f9c",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.y}名`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            callback: function (value) {
              return value + "名";
            },
          },
        },
      },
    },
  });
}

function renderTierChart(tiers) {
  if (!elements.tierChart) {
    return;
  }
  if (!tiers) {
    destroyChart("tier");
    clearCanvas(elements.tierChart);
    return;
  }

  if (chartInstances.tier) {
    chartInstances.tier.destroy();
  }

  const data = [
    { label: "S", value: tiers.S || 0, color: "#1b4f9c" },
    { label: "A", value: tiers.A || 0, color: "#4a7bd1" },
    { label: "B", value: tiers.B || 0, color: "#7fa3e5" },
    { label: "C", value: tiers.C || 0, color: "#c2d4f2" },
  ].filter((item) => item.value > 0);

  if (!data.length) {
    destroyChart("tier");
    clearCanvas(elements.tierChart);
    return;
  }

  chartInstances.tier = new Chart(elements.tierChart, {
    type: "pie",
    data: {
      labels: data.map((item) => `ランク${item.label}`),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => item.color),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              return `${label}: ${value.toFixed(1)}%`;
            },
          },
        },
      },
    },
  });
}

function renderTrendChart(school) {
  if (!elements.trendChart || !school || !school.years || school.years.length < 2) {
    if (elements.trendCard) {
      elements.trendCard.style.display = "none";
    }
    return;
  }

  if (elements.trendCard) {
    elements.trendCard.style.display = "";
  }

  if (chartInstances.trend) {
    chartInstances.trend.destroy();
  }

  const sortedYears = [...school.years]
    .filter((y) => y.year != null)
    .sort((a, b) => a.year - b.year);

  if (sortedYears.length < 2) {
    if (elements.trendCard) {
      elements.trendCard.style.display = "none";
    }
    return;
  }

  const labels = sortedYears.map((y) => `${y.year}年度`);
  const scores = sortedYears.map((y) => y.advScore ?? null);
  const tierS = sortedYears.map((y) => (y.tiers?.S || 0));
  const tierA = sortedYears.map((y) => (y.tiers?.A || 0));
  const tierB = sortedYears.map((y) => (y.tiers?.B || 0));
  const tierC = sortedYears.map((y) => (y.tiers?.C || 0));

  chartInstances.trend = new Chart(elements.trendChart, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "進学偏差値",
          data: scores,
          borderColor: "#1b4f9c",
          backgroundColor: "rgba(27, 79, 156, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "ランクS",
          data: tierS,
          borderColor: "#1b4f9c",
          backgroundColor: "rgba(27, 79, 156, 0.3)",
          borderWidth: 1,
          fill: false,
          yAxisID: "y1",
        },
        {
          label: "ランクA",
          data: tierA,
          borderColor: "#4a7bd1",
          backgroundColor: "rgba(74, 123, 209, 0.3)",
          borderWidth: 1,
          fill: false,
          yAxisID: "y1",
        },
        {
          label: "ランクB",
          data: tierB,
          borderColor: "#7fa3e5",
          backgroundColor: "rgba(127, 163, 229, 0.3)",
          borderWidth: 1,
          fill: false,
          yAxisID: "y1",
        },
        {
          label: "ランクC",
          data: tierC,
          borderColor: "#c2d4f2",
          backgroundColor: "rgba(194, 212, 242, 0.3)",
          borderWidth: 1,
          fill: false,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || "";
              const value = context.parsed.y;
              if (label === "進学偏差値") {
                return `${label}: ${value != null ? value.toFixed(1) : "-"}`;
              }
              return `${label}: ${value.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "進学偏差値",
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "ランク分布 (%)",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });
}
