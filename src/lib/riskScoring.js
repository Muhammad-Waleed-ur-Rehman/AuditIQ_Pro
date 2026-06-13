/**
 * AuditIQ Pro - Risk Scoring Logic (ISA 315)
 * Calculates a normalized audit risk score between 0 and 100.
 * 
 * Weights assigned to factors:
 * - Industry Risk: 15%
 * - Revenue Size: 15%
 * - Employee Count: 10%
 * - Internal Control Rating: 25%
 * - Prior Audit Findings: 15%
 * - Management Integrity Rating: 20%
 * 
 * Risk levels:
 * - 0–39: Low
 * - 40–69: Medium
 * - 70–100: High
 */

export function calculateRiskScore(inputs) {
  const { industry, revenue, employees, controlRating, priorFindings, integrityRating } = inputs;
  
  // 1. Industry Risk (15% weight)
  let industryScore = 50;
  const industryWeights = {
    'Financial Services': 95, // High complexity: regulatory compliance & valuation models
    'Healthcare': 85,         // High complexity: privacy protocols & billing codes
    'Technology': 90,         // High complexity: ASC 606 revenue rules & intangible assets
    'Manufacturing': 70,      // Med complexity: cost accounts & obsolescence checks
    'Retail': 60,             // Med complexity: high transaction count & shrinkages
    'Other': 40               // Low complexity: generic services
  };
  if (industryWeights[industry] !== undefined) {
    industryScore = industryWeights[industry];
  }

  // 2. Revenue Size Risk (15% weight)
  const revNum = parseFloat(revenue) || 0;
  let revenueScore = 30;
  if (revNum > 500) {
    revenueScore = 100; // Enterprise-grade exposure
  } else if (revNum > 100) {
    revenueScore = 80;  // High mid-market
  } else if (revNum > 50) {
    revenueScore = 60;  // Standard mid-market
  } else if (revNum >= 10) {
    revenueScore = 45;  // Small-to-medium enterprise
  }

  // 3. Employee Count Risk (10% weight)
  const empNum = parseInt(employees) || 0;
  let employeeScore = 30;
  if (empNum > 1000) {
    employeeScore = 100; // Enterprise structure control complexity
  } else if (empNum > 250) {
    employeeScore = 75;  // Mid-Large scale
  } else if (empNum >= 100) {
    employeeScore = 50;  // Mid scale
  }

  // 4. Internal Control Rating (25% weight)
  let controlScore = 50;
  if (controlRating === 'Weak') {
    controlScore = 100; // Maximum control environment vulnerability
  } else if (controlRating === 'Moderate') {
    controlScore = 60;  // Moderate gaps present
  } else if (controlRating === 'Strong') {
    controlScore = 15;  // Robust controls in place
  }

  // 5. Prior Audit Findings (15% weight)
  let findingsScore = 50;
  if (priorFindings === 'Material Weakness') {
    findingsScore = 100; // Serious ongoing report risks
  } else if (priorFindings === 'Significant Deficiency') {
    findingsScore = 75;  // Non-trivial issues noted
  } else if (priorFindings === 'Minor Findings') {
    findingsScore = 40;  // Immaterial disclosures
  } else if (priorFindings === 'None') {
    findingsScore = 10;  // Clean opinion history
  }

  // 6. Management Integrity Rating (20% weight)
  let integrityScore = 50;
  if (integrityRating === 'Low') {
    integrityScore = 100; // High likelihood of management override of controls
  } else if (integrityRating === 'Medium') {
    integrityScore = 60;  // Moderately aggressive reporting posture
  } else if (integrityRating === 'High') {
    integrityScore = 10;  // Highly conservative governance posture
  }

  // Calculate Weighted score
  const score = Math.round(
    (industryScore * 0.15) +
    (revenueScore * 0.15) +
    (employeeScore * 0.10) +
    (controlScore * 0.25) +
    (findingsScore * 0.15) +
    (integrityScore * 0.20)
  );

  // Categorize risk level
  let level = 'Low';
  if (score >= 70) {
    level = 'High';
  } else if (score >= 40) {
    level = 'Medium';
  }

  // Generate dynamic textual findings
  const keyRiskFactors = [];
  if (controlRating === 'Weak') {
    keyRiskFactors.push('COSO Control Failures: Weak rating indicates internal controls cannot prevent or catch material accounting misstatements.');
  }
  if (priorFindings === 'Material Weakness') {
    keyRiskFactors.push('Unresolved Reporting Deficiencies: Historic material weaknesses raise audit risk for the current fiscal period.');
  }
  if (integrityRating === 'Low') {
    keyRiskFactors.push('Compromised Tone at the Top: Low integrity rating signals high risk of corporate code overrides and reporting bias.');
  }
  if (revNum > 500) {
    keyRiskFactors.push(`High Transaction Volume: Revenue of $${revenue}M creates high absolute detection risk and processing exposure.`);
  }
  if (industry === 'Technology' || industry === 'Financial Services' || industry === 'Healthcare') {
    keyRiskFactors.push(`Inherent Sector Complexity: The ${industry} sector is subject to complicated accounting guidelines and strict regulations.`);
  }
  if (keyRiskFactors.length === 0) {
    keyRiskFactors.push('Standard Inherent Risks: Generic day-to-day operations with stable control environments.');
  }

  // Generate suggested focus areas
  const focusAreas = [];
  if (industry === 'Technology') {
    focusAreas.push('Revenue Recognition: Audit contract terms for performance obligations under ASC 606 (IFRS 15).');
    focusAreas.push('Intangibles & Capitalized R&D: Verify logic for capitalized software development costs.');
  } else if (industry === 'Financial Services') {
    focusAreas.push('Fair Value Valuation: Recalculate Level 2/3 asset models with valuation experts.');
    focusAreas.push('Regulatory Compliance: Verify disclosures for capital reserve thresholds.');
  } else if (industry === 'Healthcare') {
    focusAreas.push('Receivable Allowances: Audit reserves for third-party payor contractual adjustments.');
    focusAreas.push('Data Compliance: Verify operational controls regarding patient database security rules.');
  } else if (industry === 'Manufacturing' || industry === 'Retail') {
    focusAreas.push('Inventory Obsolescence: Perform physical counts and test lower-of-cost-or-NRV valuation templates.');
  } else {
    focusAreas.push('Sales & Receivables: Test billing journals for cutoff errors near fiscal year-end.');
  }

  if (controlRating === 'Weak' || priorFindings === 'Material Weakness') {
    focusAreas.push('Journal Entry Testing: Expand sample diagnostics (e.g. check for off-hour or round-sum postings).');
    focusAreas.push('Management Override Controls: Audit management override safeguards and board oversight files.');
  } else {
    focusAreas.push('Substantive Analytics: Use comparative trend tools and budget-to-actual variance audits.');
  }

  // Generate fraud indicators
  const fraudIndicators = [];
  if (integrityRating === 'Low') {
    fraudIndicators.push('Critical: Low management integrity rating represents a high risk of manual override of system restrictions.');
    fraudIndicators.push('Critical: Higher incentive for window-dressing financial positions to meet loan parameters or performance bonus goals.');
  } else if (integrityRating === 'Medium') {
    fraudIndicators.push('Warning: Medium management integrity rating. Review board minutes for aggressive policy pushbacks.');
  }

  if (controlRating === 'Weak') {
    fraudIndicators.push('Warning: Deficiencies in control separation make the system vulnerable to insider processing of unauthorized adjustments.');
  }

  if (priorFindings === 'Material Weakness' && controlRating === 'Weak') {
    fraudIndicators.push('Warning: Reoccurring control flaws show management lacks remediation pace, increasing risk of recurring misstatement.');
  }

  if (fraudIndicators.length === 0) {
    fraudIndicators.push('Low: High integrity and robust controls significantly lower fraud likelihood. Standard checks apply.');
  }

  return {
    score,
    level,
    keyRiskFactors,
    focusAreas,
    fraudIndicators,
    timestamp: new Date().toLocaleDateString(),
    inputs: { industry, revenue, employees, controlRating, priorFindings, integrityRating }
  };
}
