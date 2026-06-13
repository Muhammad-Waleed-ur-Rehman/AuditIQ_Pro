/**
 * AuditIQ Pro - Financial Ratio Calculations Library
 * Computes financial metrics and identifies audit red flags.
 */

// Helper to convert strings or values to numbers safely
const parseVal = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Clean currency symbols, commas, and spaces
  const cleaned = String(val).replace(/[$,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

// 1. Current Ratio
export const calculateCurrentRatio = (currentAssets, currentLiabilities) => {
  const assets = parseVal(currentAssets);
  const liabilities = parseVal(currentLiabilities);
  return liabilities === 0 ? 0 : assets / liabilities;
};

// 2. Quick Ratio
export const calculateQuickRatio = (currentAssets, inventory, currentLiabilities) => {
  const assets = parseVal(currentAssets);
  const inv = parseVal(inventory);
  const liabilities = parseVal(currentLiabilities);
  return liabilities === 0 ? 0 : (assets - inv) / liabilities;
};

// 3. Gross Profit Margin (%)
export const calculateGrossProfitMargin = (revenue, cogs) => {
  const rev = parseVal(revenue);
  const cost = parseVal(cogs);
  if (rev === 0) return 0;
  return ((rev - cost) / rev) * 100;
};

// 4. Net Profit Margin (%)
export const calculateNetProfitMargin = (netIncome, revenue) => {
  const inc = parseVal(netIncome);
  const rev = parseVal(revenue);
  if (rev === 0) return 0;
  return (inc / rev) * 100;
};

// 5. Debt Ratio (%)
export const calculateDebtRatio = (totalLiabilities, totalAssets) => {
  const liabilities = parseVal(totalLiabilities);
  const assets = parseVal(totalAssets);
  if (assets === 0) return 0;
  return (liabilities / assets) * 100;
};

// 6. Debt-to-Equity Ratio
export const calculateDebtToEquityRatio = (totalLiabilities, equity) => {
  const liabilities = parseVal(totalLiabilities);
  const eq = parseVal(equity);
  return eq === 0 ? 0 : liabilities / eq;
};

/**
 * Validates whether the CSV headers contain all required fields.
 */
export const validateCSVColumns = (headers) => {
  const required = [
    'year',
    'revenue',
    'costofgoodssold',
    'netincome',
    'currentassets',
    'inventory',
    'currentliabilities',
    'totalassets',
    'totalliabilities',
    'equity'
  ];

  const normalizedHeaders = headers.map(h => String(h).trim().toLowerCase().replace(/[\s_]/g, ''));
  const missing = required.filter(field => !normalizedHeaders.includes(field));
  
  return {
    isValid: missing.length === 0,
    missing: missing
  };
};

/**
 * Analyzes financial datasets, calculates yearly ratios, trends, and flags anomalies.
 */
export const analyzeFinancialData = (rows) => {
  // Helper to find a value by case-insensitive key match
  const getVal = (row, key) => {
    const target = key.toLowerCase().replace(/[\s_]/g, '');
    const actualKey = Object.keys(row).find(k => k.toLowerCase().replace(/[\s_]/g, '') === target);
    return actualKey ? parseVal(row[actualKey]) : 0;
  };

  // Filter out empty rows and sort ascending by year for trend comparisons
  const validRows = rows.filter(r => {
    const y = getVal(r, 'year');
    return y > 0;
  });
  
  const sortedRows = [...validRows].sort((a, b) => getVal(a, 'year') - getVal(b, 'year'));
  
  const results = sortedRows.map((row, index) => {
    const year = getVal(row, 'year');
    const revenue = getVal(row, 'revenue');
    const cogs = getVal(row, 'costofgoodssold');
    const netIncome = getVal(row, 'netincome');
    const currentAssets = getVal(row, 'currentassets');
    const inventory = getVal(row, 'inventory');
    const currentLiabilities = getVal(row, 'currentliabilities');
    const totalAssets = getVal(row, 'totalassets');
    const totalLiabilities = getVal(row, 'totalliabilities');
    const equity = getVal(row, 'equity');

    // Compute ratios
    const currentRatio = calculateCurrentRatio(currentAssets, currentLiabilities);
    const quickRatio = calculateQuickRatio(currentAssets, inventory, currentLiabilities);
    const grossProfitMargin = calculateGrossProfitMargin(revenue, cogs);
    const netProfitMargin = calculateNetProfitMargin(netIncome, revenue);
    const debtRatio = calculateDebtRatio(totalLiabilities, totalAssets);
    const debtToEquity = calculateDebtToEquityRatio(totalLiabilities, equity);

    // Calculate YoY shifts
    let revenueChange = 0;
    let netIncomeChange = 0;
    const priorRow = index > 0 ? sortedRows[index - 1] : null;

    if (priorRow) {
      const priorRev = parseVal(priorRow.Revenue);
      const priorNet = parseVal(priorRow.NetIncome);
      revenueChange = priorRev === 0 ? 0 : ((revenue - priorRev) / priorRev) * 100;
      netIncomeChange = priorNet === 0 ? 0 : ((netIncome - priorNet) / priorNet) * 100;
    }

    // Evaluate Audit Risk Red Flags
    const redFlags = [];

    // 1. Current Ratio below 1.2 = liquidity risk
    if (currentRatio < 1.2) {
      redFlags.push({
        type: 'liquidity',
        title: 'Liquidity Risk (Current Ratio < 1.2)',
        message: `The Current Ratio of ${currentRatio.toFixed(2)} is below the safety threshold of 1.20. The entity may face severe difficulty meeting its short-term debt obligations.`
      });
    }

    // 2. Net Profit Margin below 5% = profitability risk
    if (netProfitMargin < 5) {
      redFlags.push({
        type: 'profitability',
        title: 'Profitability Risk (Net Margin < 5%)',
        message: `Net Profit Margin of ${netProfitMargin.toFixed(1)}% falls below the benchmark of 5.0%, showing weak operational returns.`
      });
    }

    // 3. Debt Ratio above 60% = solvency risk
    if (debtRatio > 60) {
      redFlags.push({
        type: 'solvency',
        title: 'Solvency Risk (Debt Ratio > 60%)',
        message: `Total Debt to Assets of ${debtRatio.toFixed(1)}% is above the 60.0% safety benchmark, indicating high leverage and financial risk.`
      });
    }

    // 4. Revenue decline compared to previous year = performance risk
    if (priorRow && revenue < parseVal(priorRow.Revenue)) {
      redFlags.push({
        type: 'performance',
        title: 'Performance Risk (YoY Revenue Decline)',
        message: `Revenue declined by ${Math.abs(revenueChange).toFixed(1)}% YoY (from $${parseVal(priorRow.Revenue).toLocaleString()} down to $${revenue.toLocaleString()}).`
      });
    }

    // 5. Net income decline compared to previous year = profit risk
    if (priorRow && netIncome < parseVal(priorRow.NetIncome)) {
      redFlags.push({
        type: 'profit',
        title: 'Profit Risk (YoY Net Income Decline)',
        message: `Net income fell by ${Math.abs(netIncomeChange).toFixed(1)}% YoY (from $${parseVal(priorRow.NetIncome).toLocaleString()} down to $${netIncome.toLocaleString()}).`
      });
    }

    return {
      year,
      raw: { revenue, cogs, netIncome, currentAssets, inventory, currentLiabilities, totalAssets, totalLiabilities, equity },
      ratios: {
        currentRatio,
        quickRatio,
        grossProfitMargin,
        netProfitMargin,
        debtRatio,
        debtToEquity
      },
      trends: {
        revenueChange,
        netIncomeChange
      },
      redFlags
    };
  });

  return results;
};
