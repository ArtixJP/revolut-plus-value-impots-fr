// analytics.js
// -------------
// Fonctions "pures" de calcul : parsing, PMP, plus-values, dividendes, custody fees.
// Ne touche pas au DOM, ne dépend que des données passées en argument.

/**
 * Parse une date au format Revolut (string -> Date ou null).
 */
function parseDate(value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  
  /**
   * Extrait la partie numérique d'un champ de type "USD 766.75".
   */
  function parsePriceField(str) {
    if (!str) return null;
    const parts = String(str).trim().split(/\s+/);
    const numPart = parts[parts.length - 1];
    const val = Number(numPart.replace(",", "."));
    return isNaN(val) ? null : val;
  }
  
  /**
   * Parse un nombre (string -> number), en gérant les virgules.
   */
  function parseNumber(str) {
    const val = Number(String(str).replace(",", "."));
    return isNaN(val) ? null : val;
  }
  
  /**
   * Calcule les plus-values, dividendes et custody fees pour un ticker donné.
   *
   * @param {Array<Object>} rows - lignes du CSV pour un ticker (brutes, avec Date, Type, Quantity, etc.)
   * @param {"yearly"|"monthly"} aggPeriod - agrégation temporelle
   * @returns {{ plusValues: Object, dividends: Object, fees: Object }}
   *
   * plusValues[bucket] = montant en EUR
   * dividends[bucket]  = montant en EUR
   * fees[bucket]       = montant en EUR (si jamais liés à ce ticker)
   */
  function computePlusValueForTicker(rows, aggPeriod) {
    const plusValues = {};
    const dividends = {};
    const fees = {};
  
    let pmp = 0.0;
    let cnt = 0.0;
  
    // Normalisation + tri chronologique
    rows = rows
      .map((r) => ({ ...r, _date: parseDate(r.Date) }))
      .filter((r) => r._date !== null)
      .sort((a, b) => a._date - b._date);
  
    for (const row of rows) {
      const date = row._date;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
  
      const bucket =
        aggPeriod === "yearly"
          ? String(year)
          : `${year}-${String(month).padStart(2, "0")}`;
  
      const type = String(row.Type || "");
  
      if (type.includes("BUY")) {
        const quantity = parseNumber(row.Quantity);
        const priceUsd = parsePriceField(row["Price per share"]);
        const fx = parseNumber(row["FX Rate"]) ?? 1.0;
  
        if (quantity && priceUsd != null && fx != null) {
          const priceEur = priceUsd * fx;
          const totalCost = quantity * priceEur;
          const newCnt = cnt + quantity;
  
          if (newCnt > 0) {
            pmp = (cnt * pmp + totalCost) / newCnt;
            cnt = newCnt;
          }
        }
      } else if (type.includes("SELL")) {
        const quantity = parseNumber(row.Quantity);
        const priceUsd = parsePriceField(row["Price per share"]);
        const fx = parseNumber(row["FX Rate"]) ?? 1.0;
  
        if (quantity && priceUsd != null && fx != null) {
          const priceEur = priceUsd * fx;
          const plus = quantity * (priceEur - pmp);
          plusValues[bucket] = (plusValues[bucket] || 0) + plus;
          cnt -= quantity;
        }
      } else if (type.includes("STOCK SPLIT")) {
        const ratio = parseNumber(row.Quantity);
        if (ratio != null) {
          cnt *= ratio;
          if (ratio !== 0) {
            pmp /= ratio;
          }
        }
      } else if (type.includes("DIVIDEND")) {
        const amtUsd = parsePriceField(row["Total Amount"]);
        const fx = parseNumber(row["FX Rate"]) ?? 1.0;
  
        if (amtUsd != null && fx != null) {
          const amtEur = amtUsd * fx;
          dividends[bucket] = (dividends[bucket] || 0) + amtEur;
        }
      } else if (type.includes("CUSTODY FEE")) { // normalement inutile car pas de ticker associé aux fees
        const amtUsd = parsePriceField(row["Total Amount"]);
        const fx = parseNumber(row["FX Rate"]) ?? 1.0;
  
        if (amtUsd != null && fx != null) {
          const amtEur = amtUsd * fx;
          fees[bucket] = (fees[bucket] || 0) + amtEur;
        }
      }
    }
  
    return { plusValues, dividends, fees };
  }
  
  /**
   * Custody fees globaux (tous tickers confondus), agrégés par période.
   *
   * @param {Array<Object>} rows - toutes les lignes CSV
   * @param {"yearly"|"monthly"} aggPeriod
   * @returns {Object} feesByBucket
   */
  function computeGlobalCustodyFees(rows, aggPeriod) {
    const feesByBucket = {};
  
    const withDate = rows
      .map((r) => ({ ...r, _date: parseDate(r.Date) }))
      .filter((r) => r._date !== null);
  
    for (const row of withDate) {
      const type = String(row.Type || "");
      if (!type.includes("CUSTODY FEE")) continue;
  
      const date = row._date;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
  
      const bucket =
        aggPeriod === "yearly"
          ? String(year)
          : `${year}-${String(month).padStart(2, "0")}`;
  
      const amtUsd = parsePriceField(row["Total Amount"]);
      const fx = parseNumber(row["FX Rate"]) ?? 1.0;
  
      if (amtUsd != null && fx != null) {
        const amtEur = amtUsd * fx;
        feesByBucket[bucket] = (feesByBucket[bucket] || 0) + amtEur;
      }
    }
  
    return feesByBucket;
  }
  