(() => {
  const data = window.TRACKER_DATA;
  const days = data.days.slice().sort((a, b) => a.date.localeCompare(b.date));
  const targets = data.targets;

  const COLORS = {
    teal: '#6ef0d1',
    blue: '#5e81f4',
    purple: '#a07ef0',
    yellow: '#f4c25e',
    red: '#ff6b6b',
    orange: '#ff9f43',
    muted: '#8e8e93',
    grid: 'rgba(255,255,255,0.06)',
    targetCal: 'rgba(255, 92, 92, 0.85)',
    targetPro: 'rgba(142, 142, 147, 0.7)',
  };

  let selectedIndex = days.length - 1;

  const el = {
    headerTitle: document.getElementById('headerTitle'),
    headerDate: document.getElementById('headerDate'),
    prevDay: document.getElementById('prevDay'),
    nextDay: document.getElementById('nextDay'),
    weightValue: document.getElementById('weightValue'),
    ringNumber: document.getElementById('ringNumber'),
    ringSub: document.getElementById('ringSub'),
    summaryCals: document.getElementById('summaryCals'),
    summaryCalsTarget: document.getElementById('summaryCalsTarget'),
    summaryCalsPct: document.getElementById('summaryCalsPct'),
    summaryProtein: document.getElementById('summaryProtein'),
    summaryProteinTarget: document.getElementById('summaryProteinTarget'),
    summaryProteinPct: document.getElementById('summaryProteinPct'),
    barCalsStats: document.getElementById('barCalsStats'),
    barCalsFill: document.getElementById('barCalsFill'),
    barProteinStats: document.getElementById('barProteinStats'),
    barProteinFill: document.getElementById('barProteinFill'),
    barFatStats: document.getElementById('barFatStats'),
    barFatFill: document.getElementById('barFatFill'),
    barSugarStats: document.getElementById('barSugarStats'),
    barSugarFill: document.getElementById('barSugarFill'),
    histCalsValue: document.getElementById('histCalsValue'),
    histCalsTarget: document.getElementById('histCalsTarget'),
    histProteinValue: document.getElementById('histProteinValue'),
    histProteinTarget: document.getElementById('histProteinTarget'),
  };

  function parseLocalDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatHeaderDate(iso) {
    const dt = parseLocalDate(iso);
    const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' });
    const month = dt.toLocaleDateString('en-US', { month: 'short' });
    const day = dt.getDate();
    return `${weekday} • ${month} ${day}`;
  }

  function formatAxisLabel(iso) {
    const dt = parseLocalDate(iso);
    const month = dt.toLocaleDateString('en-US', { month: 'short' });
    return `${month} ${dt.getDate()}`;
  }

  function fmtNum(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function pct(value, target) {
    if (!target) return 0;
    return Math.round((value / target) * 100);
  }

  function clampPct(p) {
    return Math.min(100, Math.max(0, p));
  }

  // Charts
  let weightChart, ringChart, caloriesChart, proteinChart;

  function commonScales() {
    return {
      x: {
        grid: { display: false },
        ticks: {
          color: COLORS.muted,
          font: { size: 10, weight: '500' },
          maxRotation: 0,
          autoSkip: false,
          callback(value, index) {
            // Show every other label to match mock (Sep 10, 12, 14, 16)
            return index % 2 === 0 ? this.getLabelForValue(value) : '';
          },
        },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
        border: { display: false },
      },
    };
  }

  function pointColors(values, target, underColor, overColor) {
    return values.map((v) => (v > target ? overColor : underColor));
  }

  function buildWeightChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    const labels = days.map((d) => formatAxisLabel(d.date));
    const values = days.map((d) => d.weight);
    const min = Math.min(...values) - 0.4;
    const max = Math.max(...values) + 0.4;

    weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: COLORS.teal,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3.5,
          pointHoverRadius: 5,
          pointBackgroundColor: COLORS.teal,
          pointBorderColor: COLORS.teal,
          pointBorderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          ...commonScales(),
          y: { display: false, min, max, grid: { display: false }, border: { display: false } },
        },
        layout: { padding: { top: 4, bottom: 0 } },
      },
    });
  }

  function buildRingChart() {
    const ctx = document.getElementById('ringChart').getContext('2d');
    ringChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [0, 100],
          backgroundColor: [COLORS.teal, '#2c2c2e'],
          borderWidth: 0,
          hoverOffset: 0,
        }],
      },
      options: {
        responsive: false,
        cutout: '78%',
        rotation: -90,
        circumference: 360,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 350 },
      },
    });
  }

  function buildCaloriesChart() {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    const labels = days.map((d) => formatAxisLabel(d.date));
    const values = days.map((d) => d.calories);
    const yMin = Math.min(Math.min(...values), targets.calories) - 200;
    const yMax = Math.max(Math.max(...values), targets.calories) + 150;

    caloriesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: COLORS.teal,
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: pointColors(values, targets.calories, COLORS.teal, COLORS.orange),
            pointBorderWidth: 0,
            order: 1,
          },
          {
            data: days.map(() => targets.calories),
            borderColor: COLORS.targetCal,
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0,
            order: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { filter: (item) => item.datasetIndex === 0 } },
        scales: {
          x: commonScales().x,
          y: { display: false, min: yMin, max: yMax, grid: { display: false }, border: { display: false } },
        },
      },
    });
  }

  function buildProteinChart() {
    const ctx = document.getElementById('proteinChart').getContext('2d');
    const labels = days.map((d) => formatAxisLabel(d.date));
    const values = days.map((d) => d.protein);
    const yMin = Math.min(Math.min(...values), targets.protein) - 20;
    const yMax = Math.max(Math.max(...values), targets.protein) + 20;

    proteinChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: COLORS.blue,
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: pointColors(values, targets.protein, COLORS.blue, COLORS.orange),
            pointBorderWidth: 0,
            order: 1,
          },
          {
            data: days.map(() => targets.protein),
            borderColor: COLORS.targetPro,
            borderWidth: 1.5,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0,
            order: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { filter: (item) => item.datasetIndex === 0 } },
        scales: {
          x: commonScales().x,
          y: { display: false, min: yMin, max: yMax, grid: { display: false }, border: { display: false } },
        },
      },
    });
  }

  function updateRing(day) {
    const eaten = day.calories;
    const target = targets.calories;
    const remaining = target - eaten;
    const over = remaining < 0;
    const filled = clampPct(pct(eaten, target));

    ringChart.data.datasets[0].data = [filled, Math.max(0, 100 - filled)];
    ringChart.data.datasets[0].backgroundColor = [
      over ? COLORS.orange : COLORS.teal,
      '#2c2c2e',
    ];
    ringChart.update();

    if (over) {
      el.ringNumber.textContent = fmtNum(Math.abs(remaining));
      el.ringNumber.classList.add('over');
      el.ringSub.textContent = 'over';
    } else {
      el.ringNumber.textContent = fmtNum(remaining);
      el.ringNumber.classList.remove('over');
      el.ringSub.textContent = 'left';
    }
  }

  function setBar(fillEl, pctVal, over) {
    fillEl.style.width = `${clampPct(pctVal)}%`;
    fillEl.classList.toggle('over', !!over && fillEl.classList.contains('teal'));
  }

  function updateUI() {
    const day = days[selectedIndex];
    const isLatest = selectedIndex === days.length - 1;

    el.headerTitle.textContent = isLatest ? 'Today' : formatHeaderDate(day.date).split(' • ')[0];
    // Keep "Today" for latest; for others show weekday as title feels odd — use date string style from mock
    if (isLatest) {
      el.headerTitle.textContent = 'Today';
    } else {
      const dt = parseLocalDate(day.date);
      el.headerTitle.textContent = dt.toLocaleDateString('en-US', { weekday: 'long' });
    }
    el.headerDate.textContent = formatHeaderDate(day.date);

    el.prevDay.disabled = selectedIndex <= 0;
    el.nextDay.disabled = selectedIndex >= days.length - 1;

    el.weightValue.textContent = day.weight.toFixed(1);

    const calPct = pct(day.calories, targets.calories);
    const proPct = pct(day.protein, targets.protein);
    const fatPct = pct(day.fat, targets.fat);
    const sugarPct = pct(day.sugar, targets.sugar);
    const calOver = day.calories > targets.calories;

    el.summaryCals.textContent = fmtNum(day.calories);
    el.summaryCalsTarget.textContent = fmtNum(targets.calories);
    el.summaryCalsPct.textContent = `${calPct}%`;
    el.summaryCalsPct.classList.toggle('over', calOver);

    el.summaryProtein.textContent = `${fmtNum(day.protein)}g`;
    el.summaryProteinTarget.textContent = `${fmtNum(targets.protein)}g`;
    el.summaryProteinPct.textContent = `${proPct}%`;

    el.barCalsStats.textContent = `${fmtNum(day.calories)} / ${fmtNum(targets.calories)} • ${calPct}%`;
    setBar(el.barCalsFill, calPct, calOver);
    if (calOver) {
      el.barCalsFill.classList.remove('teal');
      el.barCalsFill.classList.add('over');
    } else {
      el.barCalsFill.classList.add('teal');
      el.barCalsFill.classList.remove('over');
    }

    el.barProteinStats.textContent = `${fmtNum(day.protein)}g / ${fmtNum(targets.protein)}g • ${proPct}%`;
    setBar(el.barProteinFill, proPct, false);

    el.barFatStats.textContent = `${fmtNum(day.fat)}g`;
    setBar(el.barFatFill, fatPct, false);

    el.barSugarStats.textContent = `${fmtNum(day.sugar)}g`;
    setBar(el.barSugarFill, sugarPct, false);

    el.histCalsValue.textContent = fmtNum(day.calories);
    el.histCalsTarget.textContent = fmtNum(targets.calories);
    el.histProteinValue.textContent = `${fmtNum(day.protein)}g`;
    el.histProteinTarget.textContent = `${fmtNum(targets.protein)}g`;

    updateRing(day);

    // Highlight selected day on history charts via point radius
    highlightSelectedPoints();
  }

  function highlightSelectedPoints() {
    const baseR = 4;
    const selectedR = 6;
    const radii = days.map((_, i) => (i === selectedIndex ? selectedR : baseR));

    if (caloriesChart) {
      caloriesChart.data.datasets[0].pointRadius = radii;
      caloriesChart.update('none');
    }
    if (proteinChart) {
      proteinChart.data.datasets[0].pointRadius = radii;
      proteinChart.update('none');
    }
    if (weightChart) {
      weightChart.data.datasets[0].pointRadius = days.map((_, i) => (i === selectedIndex ? 5 : 3.5));
      weightChart.update('none');
    }
  }

  function init() {
    Chart.defaults.color = COLORS.muted;
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    buildWeightChart();
    buildRingChart();
    buildCaloriesChart();
    buildProteinChart();
    updateUI();

    el.prevDay.addEventListener('click', () => {
      if (selectedIndex > 0) {
        selectedIndex -= 1;
        updateUI();
      }
    });
    el.nextDay.addEventListener('click', () => {
      if (selectedIndex < days.length - 1) {
        selectedIndex += 1;
        updateUI();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') el.prevDay.click();
      if (e.key === 'ArrowRight') el.nextDay.click();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
