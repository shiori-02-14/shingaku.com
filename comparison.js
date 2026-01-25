const state = {
  schools: [],
  comparisonList: [],
};

const elements = {};
let chartInstances = {
  score: null,
  tier: null,
};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindLogoReload();
  loadComparison();
});

function cacheElements() {
  elements.comparisonContent = document.getElementById("comparisonContent");
}

function bindLogoReload() {
  const logoLink = document.querySelector(".site-header .logo");
  if (!logoLink) return;
  logoLink.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (logoLink.dataset.reloading === "true") return;
    logoLink.dataset.reloading = "true";
    logoLink.classList.add("is-reloading");
    document.body.classList.add("is-reloading");
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : 200;
    window.setTimeout(() => {
      window.location.reload();
    }, delay);
  });
}

async function loadComparison() {
  try {
    state.schools = await SchoolData.loadSchools();
    loadComparisonList();
    if (state.comparisonList.length === 0) {
      renderEmpty();
      return;
    }
    renderComparison();
  } catch (error) {
    renderError("比較データを読み込めませんでした。");
  }
}

function loadComparisonList() {
  try {
    const data = localStorage.getItem("comparisonList");
    if (!data) return;
    const ids = JSON.parse(data);
    state.comparisonList = state.schools.filter((s) => ids.includes(s.id));
  } catch (e) {
    console.error("Failed to load comparison list", e);
  }
}

function renderEmpty() {
  elements.comparisonContent.innerHTML = `
    <div class="empty-state">
      比較する学校が選択されていません。<br />
      <a href="index.html">高校を探す</a>ページから学校を選択してください。
    </div>
  `;
}

function renderError(message) {
  elements.comparisonContent.innerHTML = `
    <div class="empty-state">${message}</div>
  `;
}

function renderComparison() {
  if (state.comparisonList.length === 0) {
    renderEmpty();
    return;
  }

  const fragment = document.createDocumentFragment();

  const headerCard = document.createElement("div");
  headerCard.className = "detail-card";
  headerCard.innerHTML = `
    <h2>比較対象: ${state.comparisonList.length}校</h2>
    <p>選択した学校の進学偏差値とランク分布を比較します。</p>
  `;
  fragment.appendChild(headerCard);

  const scoreCard = document.createElement("div");
  scoreCard.className = "detail-card chart-full-width";
  scoreCard.innerHTML = `
    <h2>進学偏差値の比較</h2>
    <div class="chart-container">
      <canvas id="scoreChart"></canvas>
    </div>
  `;
  fragment.appendChild(scoreCard);

  const tierCard = document.createElement("div");
  tierCard.className = "detail-card chart-full-width";
  tierCard.innerHTML = `
    <h2>ランク分布の比較</h2>
    <div class="chart-container">
      <canvas id="tierChart"></canvas>
    </div>
  `;
  fragment.appendChild(tierCard);

  const tableCard = document.createElement("div");
  tableCard.className = "detail-card chart-full-width";
  tableCard.innerHTML = `
    <h2>詳細比較表</h2>
    <div class="comparison-table-container">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>学校名</th>
            <th>区</th>
            <th>国公私立</th>
            <th>男女</th>
            <th>進学偏差値</th>
            <th>ランクS</th>
            <th>ランクA</th>
            <th>ランクB</th>
            <th>ランクC</th>
          </tr>
        </thead>
        <tbody>
          ${state.comparisonList
            .map(
              (school) => {
                const detailHref = school.slug
                  ? `schools/${encodeURIComponent(school.slug)}.html`
                  : school.id
                  ? `schools/${encodeURIComponent(school.id)}.html`
                  : "";
                return `
            <tr>
              <td>${detailHref ? `<a href="${detailHref}">${escapeHtml(school.name)}</a>` : escapeHtml(school.name)}</td>
              <td>${escapeHtml(school.ward)}</td>
              <td>${escapeHtml(school.type)}</td>
              <td>${escapeHtml(school.gender)}</td>
              <td class="score-cell">${formatScore(school.advScore)}</td>
              <td>${formatPercent(school.tiers.S)}%</td>
              <td>${formatPercent(school.tiers.A)}%</td>
              <td>${formatPercent(school.tiers.B)}%</td>
              <td>${formatPercent(school.tiers.C)}%</td>
            </tr>
          `;
              }
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
  fragment.appendChild(tableCard);

  elements.comparisonContent.innerHTML = "";
  elements.comparisonContent.appendChild(fragment);

  if (typeof Chart !== "undefined") {
    renderScoreChart();
    renderTierChart();
  }
}

function renderScoreChart() {
  const canvas = document.getElementById("scoreChart");
  if (!canvas) return;

  if (chartInstances.score) {
    chartInstances.score.destroy();
  }

  const labels = state.comparisonList.map((s) => escapeHtml(s.name));
  const scores = state.comparisonList.map((s) => s.advScore ?? null);

  chartInstances.score = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "進学偏差値",
          data: scores,
          backgroundColor: "#4a7bd1",
          borderColor: "#1b4f9c",
          borderWidth: 2,
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
              const value = context.parsed.y;
              return `進学偏差値: ${value != null ? value.toFixed(1) : "-"}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "進学偏差値",
          },
        },
      },
    },
  });
}

function renderTierChart() {
  const canvas = document.getElementById("tierChart");
  if (!canvas) return;

  if (chartInstances.tier) {
    chartInstances.tier.destroy();
  }

  const labels = state.comparisonList.map((s) => escapeHtml(s.name));
  const tierS = state.comparisonList.map((s) => s.tiers?.S || 0);
  const tierA = state.comparisonList.map((s) => s.tiers?.A || 0);
  const tierB = state.comparisonList.map((s) => s.tiers?.B || 0);
  const tierC = state.comparisonList.map((s) => s.tiers?.C || 0);

  chartInstances.tier = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "ランクS",
          data: tierS,
          backgroundColor: "#1b4f9c",
        },
        {
          label: "ランクA",
          data: tierA,
          backgroundColor: "#4a7bd1",
        },
        {
          label: "ランクB",
          data: tierB,
          backgroundColor: "#7fa3e5",
        },
        {
          label: "ランクC",
          data: tierC,
          backgroundColor: "#c2d4f2",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "割合 (%)",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            },
          },
        },
      },
    },
  });
}

function formatScore(value) {
  return value == null ? "-" : value.toFixed(1);
}

function formatPercent(value) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
