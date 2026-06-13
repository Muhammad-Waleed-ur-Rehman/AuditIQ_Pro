export const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
export const MAGNITUDE_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];

export function getInherentRiskLevel(likelihood, magnitude) {
  const score = likelihood * magnitude;
  if (score >= 15) return 'High';
  if (score >= 7) return 'Medium';
  return 'Low';
}

export function getInherentRiskColor(level) {
  switch (level) {
    case 'High': return { bg: 'bg-red-100 text-red-800 border-red-200', badge: 'bg-red-500 text-white' };
    case 'Medium': return { bg: 'bg-amber-100 text-amber-800 border-amber-200', badge: 'bg-amber-500 text-white' };
    default: return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', badge: 'bg-emerald-500 text-white' };
  }
}

export function getControlRiskLevel(controlRiskScore) {
  if (controlRiskScore == null) return 'Unknown';
  if (controlRiskScore >= 70) return 'High';
  if (controlRiskScore >= 40) return 'Medium';
  return 'Low';
}

export function getControlRiskColor(level) {
  switch (level) {
    case 'High': return { bg: 'bg-red-100 text-red-800 border-red-200', badge: 'bg-red-500 text-white' };
    case 'Medium': return { bg: 'bg-amber-100 text-amber-800 border-amber-200', badge: 'bg-amber-500 text-white' };
    case 'Low': return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', badge: 'bg-emerald-500 text-white' };
    default: return { bg: 'bg-slate-100 text-slate-600 border-slate-200', badge: 'bg-slate-400 text-white' };
  }
}

export function getOverallRiskLevel(inherentLevel, controlLevel) {
  if (inherentLevel === 'High' || controlLevel === 'High') return 'High';
  if (inherentLevel === 'Medium' || controlLevel === 'Medium') return 'Medium';
  return 'Low';
}

export function getOverallRiskColor(level) {
  switch (level) {
    case 'High': return { bg: 'bg-red-50 text-red-700 border-red-200', badge: 'bg-red-600 text-white' };
    case 'Medium': return { bg: 'bg-amber-50 text-amber-700 border-amber-200', badge: 'bg-amber-600 text-white' };
    default: return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', badge: 'bg-emerald-600 text-white' };
  }
}

export function buildHeatmapGrid() {
  const grid = [];
  for (let lik = 5; lik >= 1; lik--) {
    const row = [];
    for (let mag = 1; mag <= 5; mag++) {
      row.push({
        likelihood: lik,
        magnitude: mag,
        level: getInherentRiskLevel(lik, mag),
        color: getInherentRiskColor(getInherentRiskLevel(lik, mag)),
        assessments: []
      });
    }
    grid.push(row);
  }
  return grid;
}

export function placeAssessmentsOnGrid(grid, assessments) {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell, assessments: [] })));
  for (const a of assessments) {
    const lik = a.likelihood;
    const mag = a.magnitude;
    if (!lik || !mag) continue;
    const rowIndex = 5 - lik;
    const colIndex = mag - 1;
    if (newGrid[rowIndex] && newGrid[rowIndex][colIndex]) {
      newGrid[rowIndex][colIndex].assessments.push(a);
    }
  }
  return newGrid;
}

export const RISK_AREA_DISPLAY = {
  'Revenue Recognition': { area: 'Revenue Recognition', assertion: 'Accuracy' },
  'Inventory Valuation': { area: 'Inventory Valuation', assertion: 'Valuation' },
  'Lease Accounting': { area: 'Lease Accounting', assertion: 'Rights and Obligations' },
  'Tax Provisions': { area: 'Tax Provisions', assertion: 'Completeness' },
  'Receivables': { area: 'Receivables', assertion: 'Valuation' },
  'Payroll': { area: 'Payroll', assertion: 'Accuracy' },
  'PP&E': { area: 'PP&E', assertion: 'Existence' },
  'Goodwill': { area: 'Goodwill', assertion: 'Valuation' },
  'Cash': { area: 'Cash', assertion: 'Existence' },
  'Liabilities': { area: 'Liabilities', assertion: 'Completeness' },
  'Other': { area: 'Other', assertion: 'Presentation and Disclosure' }
};

export function getStatusBadgeStyle(status) {
  switch (status) {
    case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'planning': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'fieldwork': return 'bg-violet-50 text-violet-600 border-violet-200';
    case 'review': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'completed': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  }
}
