// app.js
// ------
// Interaction avec le DOM, parsing du fichier via PapaParse,
// appel des fonctions de analytics.js, rendu des tableaux.

let parsedRows = [];

const fileInput = document.getElementById("fileInput");
const aggSelect = document.getElementById("aggSelect");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusEl = document.getElementById("status");
const summaryChips = document.getElementById("summaryChips");
const resultsEl = document.getElementById("results");
const pvTableContainer = document.getElementById("pvTableContainer");
const divTableContainer = document.getElementById("divTableContainer");
const feeTableContainer = document.getElementById("feeTableContainer");

fileInput.addEventListener("change", () => {
  if (fileInput.files && fileInput.files.length > 0) {
    analyzeBtn.disabled = false;
    setStatus("", "normal");
  } else {
    analyzeBtn.disabled = true;
  }
});

analyzeBtn.addEventListener("click", () => {
  if (!fileInput.files || fileInput.files.length === 0) return;

  const file = fileInput.files[0];

  setStatus("Analyse du fichier en cours...", "normal");
  resultsEl.style.display = "none";
  summaryChips.innerHTML = "";
  pvTableContainer.innerHTML = "";
  divTableContainer.innerHTML = "";
  feeTableContainer.innerHTML = "";

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      if (result.errors && result.errors.length > 0) {
        console.error(result.errors);
        setStatus("Erreur lors du parsing du CSV. Vérifie le fichier.", "error");
        return;
      }
      parsedRows = result.data;
      try {
        runAnalysis();
      } catch (e) {
        console.error(e);
        setStatus("Erreur pendant le calcul. Vérifie le format du CSV.", "error");
      }
    },
    error: (err) => {
      console.error(err);
      setStatus("Erreur lors de la lecture du fichier.", "error");
    },
  });
});

function setStatus(message, mode) {
  statusEl.textContent = message;
  if (mode === "error") statusEl.className = "status error";
  else if (mode === "success") statusEl.className = "status success";
  else statusEl.className = "status";
}

function formatMoney(value) {
  if (value == null || isNaN(value)) return "";
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function addChip(label, value) {
  const chip = document.createElement("div");
  chip.className = "pill";
  chip.innerHTML = `<span>${label}</span><span class="value">${value}</span>`;
  summaryChips.appendChild(chip);
}

function runAnalysis() {
  const aggPeriod = aggSelect.value; // 'yearly' ou 'monthly'

  if (!parsedRows || parsedRows.length === 0) {
    setStatus("Aucune donnée trouvée dans le fichier.", "error");
    return;
  }

  // Détection des tickers
  const tickersSet = new Set();
  for (const row of parsedRows) {
    const t = (row.Ticker || "").trim();
    if (t) tickersSet.add(t);
  }
  const tickers = Array.from(tickersSet).sort();

  if (tickers.length === 0) {
    setStatus("Aucun ticker détecté dans le fichier.", "error");
    return;
  }

  const pvMatrix = {};
  const divMatrix = {};
  const allBucketsSet = new Set();

  for (const ticker of tickers) {
    const rowsForTicker = parsedRows.filter(
      (r) => (r.Ticker || "").trim() === ticker
    );

    const { plusValues, dividends } = computePlusValueForTicker(
      rowsForTicker,
      aggPeriod
    );

    pvMatrix[ticker] = plusValues;
    divMatrix[ticker] = dividends;

    for (const b of Object.keys(plusValues)) allBucketsSet.add(b);
    for (const b of Object.keys(dividends)) allBucketsSet.add(b);
  }

  // Buckets triés
  const buckets = Array.from(allBucketsSet).sort((a, b) =>
    a.localeCompare(b)
  );

  // Custody fees globaux
  const feesByBucket = computeGlobalCustodyFees(parsedRows, aggPeriod);
  for (const b of Object.keys(feesByBucket)) {
    if (!buckets.includes(b)) buckets.push(b);
  }
  buckets.sort((a, b) => a.localeCompare(b));

  buildPvTable(tickers, buckets, pvMatrix);
  buildDivTable(tickers, buckets, divMatrix);
  buildFeeTable(buckets, feesByBucket);

  // Résumé en haut
  const fileName = fileInput.files[0]?.name || "N/A";
  summaryChips.innerHTML = "";
  addChip("Fichier :", fileName);
  addChip("Tickers détectés :", String(tickers.length));
  addChip("Périodes trouvées :", String(buckets.length));
  addChip(
    "Agrégation :",
    aggPeriod === "yearly" ? "Année (YYYY)" : "Mois (YYYY-MM)"
  );

  setStatus("Analyse terminée.", "success");
  resultsEl.style.display = "block";
}

/* Rendu des tableaux */

function buildPvTable(tickers, buckets, pvMatrix) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const tfoot = document.createElement("tfoot");

  const headerRow = document.createElement("tr");
  const th0 = document.createElement("th");
  th0.textContent = "Entreprise";
  headerRow.appendChild(th0);

  for (const b of buckets) {
    const th = document.createElement("th");
    th.textContent = b;
    headerRow.appendChild(th);
  }
  const thTotal = document.createElement("th");
  thTotal.textContent = "Total";
  headerRow.appendChild(thTotal);

  thead.appendChild(headerRow);

  const totalsByBucket = {};
  let grandTotal = 0;

  for (const ticker of tickers) {
    const row = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.textContent = ticker;
    row.appendChild(tdName);

    let rowTotal = 0;
    const pvForTicker = pvMatrix[ticker] || {};

    for (const b of buckets) {
      const v = pvForTicker[b] || 0;
      rowTotal += v;
      totalsByBucket[b] = (totalsByBucket[b] || 0) + v;

      const td = document.createElement("td");
      td.textContent = v === 0 ? "" : formatMoney(v);
      row.appendChild(td);
    }

    grandTotal += rowTotal;

    const tdRowTotal = document.createElement("td");
    tdRowTotal.textContent = rowTotal === 0 ? "" : formatMoney(rowTotal);
    row.appendChild(tdRowTotal);

    tbody.appendChild(row);
  }

  // Ligne TOTAL
  const totalRow = document.createElement("tr");
  const tdLabel = document.createElement("td");
  tdLabel.textContent = "TOTAL";
  totalRow.appendChild(tdLabel);

  for (const b of buckets) {
    const v = totalsByBucket[b] || 0;
    const td = document.createElement("td");
    td.textContent = v === 0 ? "" : formatMoney(v);
    totalRow.appendChild(td);
  }
  const tdGrand = document.createElement("td");
  tdGrand.textContent = formatMoney(grandTotal);
  totalRow.appendChild(tdGrand);
  tfoot.appendChild(totalRow);

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

  pvTableContainer.innerHTML = "";
  pvTableContainer.appendChild(table);
}

function buildDivTable(tickers, buckets, divMatrix) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const tfoot = document.createElement("tfoot");

  const headerRow = document.createElement("tr");
  const th0 = document.createElement("th");
  th0.textContent = "Entreprise";
  headerRow.appendChild(th0);

  for (const b of buckets) {
    const th = document.createElement("th");
    th.textContent = b;
    headerRow.appendChild(th);
  }
  const thTotal = document.createElement("th");
  thTotal.textContent = "Total";
  headerRow.appendChild(thTotal);

  thead.appendChild(headerRow);

  const totalsByBucket = {};
  let grandTotal = 0;

  for (const ticker of tickers) {
    const row = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.textContent = ticker;
    row.appendChild(tdName);

    let rowTotal = 0;
    const divForTicker = divMatrix[ticker] || {};

    for (const b of buckets) {
      const v = divForTicker[b] || 0;
      rowTotal += v;
      totalsByBucket[b] = (totalsByBucket[b] || 0) + v;

      const td = document.createElement("td");
      td.textContent = v === 0 ? "" : formatMoney(v);
      row.appendChild(td);
    }

    grandTotal += rowTotal;

    const tdRowTotal = document.createElement("td");
    tdRowTotal.textContent = rowTotal === 0 ? "" : formatMoney(rowTotal);
    row.appendChild(tdRowTotal);

    tbody.appendChild(row);
  }

  const totalRow = document.createElement("tr");
  const tdLabel = document.createElement("td");
  tdLabel.textContent = "TOTAL";
  totalRow.appendChild(tdLabel);

  for (const b of buckets) {
    const v = totalsByBucket[b] || 0;
    const td = document.createElement("td");
    td.textContent = v === 0 ? "" : formatMoney(v);
    totalRow.appendChild(td);
  }
  const tdGrand = document.createElement("td");
  tdGrand.textContent = formatMoney(grandTotal);
  totalRow.appendChild(tdGrand);
  tfoot.appendChild(totalRow);

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

  divTableContainer.innerHTML = "";
  divTableContainer.appendChild(table);
}

function buildFeeTable(buckets, feesByBucket) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const tfoot = document.createElement("tfoot");

  const headerRow = document.createElement("tr");
  const thPeriod = document.createElement("th");
  thPeriod.textContent = "Période";
  headerRow.appendChild(thPeriod);

  const thAmt = document.createElement("th");
  thAmt.textContent = "Custody fee (EUR)";
  headerRow.appendChild(thAmt);

  thead.appendChild(headerRow);

  let total = 0;

  for (const b of buckets) {
    const v = feesByBucket[b] || 0;
    if (!v) continue;

    const row = document.createElement("tr");
    const tdB = document.createElement("td");
    tdB.textContent = b;
    const tdV = document.createElement("td");
    tdV.textContent = formatMoney(v);

    row.appendChild(tdB);
    row.appendChild(tdV);
    tbody.appendChild(row);

    total += v;
  }

  const totalRow = document.createElement("tr");
  const tdLabel = document.createElement("td");
  tdLabel.textContent = "TOTAL";
  const tdVal = document.createElement("td");
  tdVal.textContent = formatMoney(total);
  totalRow.appendChild(tdLabel);
  totalRow.appendChild(tdVal);
  tfoot.appendChild(totalRow);

  table.appendChild(thead);
  table.appendChild(tbody);
  table.appendChild(tfoot);

  feeTableContainer.innerHTML = "";
  feeTableContainer.appendChild(table);
}
