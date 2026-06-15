/**
 * AuditIQ Pro - Simulation Data Engine
 * Contains helper methods for mock risk scoring, financial ratios,
 * working papers, audit programs, and AI responses.
 */

// ==========================================
// 1. RISK ASSESSMENT SIMULATOR
// ==========================================
export const generateRiskAssessment = (inputs) => {
  const { industry, revenue, employees, controlRating, priorFindings, integrityRating } = inputs;
  
  // Base score calculation
  let score = 30; // base score
  
  // Industry risk factors
  const industryRisks = {
    'Financial Services': { factor: 15, name: 'Regulatory compliance & fair value valuation of financial instruments' },
    'Healthcare': { factor: 12, name: 'Billing compliance & patient data privacy regulations' },
    'Technology': { factor: 14, name: 'Complex revenue recognition (ASC 606) & capitalized software assets' },
    'Manufacturing': { factor: 10, name: 'Inventory valuation, obsolescence, & cost accounting' },
    'Retail': { factor: 8, name: 'Inventory shrink, vendor rebates, & high-volume transactions' },
    'Other': { factor: 5, name: 'General operating controls & cash management' }
  };
  
  const indData = industryRisks[industry] || industryRisks['Other'];
  score += indData.factor;
  
  // Revenue size risk (complexity)
  const revNum = parseFloat(revenue) || 0;
  if (revNum > 500) score += 10;
  else if (revNum > 100) score += 5;
  
  // Control ratings
  if (controlRating === 'Weak') score += 25;
  else if (controlRating === 'Moderate') score += 10;
  else score -= 5;
  
  // Prior findings
  if (priorFindings === 'Material Weakness') score += 30;
  else if (priorFindings === 'Significant Deficiency') score += 15;
  else if (priorFindings === 'Minor Findings') score += 5;
  else score -= 5;
  
  // Integrity rating
  if (integrityRating === 'Low') score += 35;
  else if (integrityRating === 'Medium') score += 15;
  else score -= 10;
  
  // Clamp score
  score = Math.max(10, Math.min(98, score));
  
  // Determine category
  let category = 'Low';
  let severityColor = 'text-green-600 bg-green-50 border-green-200';
  if (score >= 75) {
    category = 'High';
    severityColor = 'text-red-600 bg-red-50 border-red-200';
  } else if (score >= 45) {
    category = 'Medium';
    severityColor = 'text-amber-600 bg-amber-50 border-amber-200';
  }
  
  // Key Risk Areas
  const riskAreas = [
    { title: 'Inherent Industry Risk', desc: `Inherent complexity in ${industry} regarding ${indData.name}.` },
  ];
  
  if (controlRating === 'Weak') {
    riskAreas.push({ title: 'Control Environment Failures', desc: 'Design or operating effectiveness deficiencies in entity-level controls.' });
  }
  if (priorFindings === 'Material Weakness') {
    riskAreas.push({ title: 'Recurring Control Deficiencies', desc: 'Unresolved material weaknesses indicating slow management remediation.' });
  }
  if (integrityRating === 'Low' || integrityRating === 'Medium') {
    riskAreas.push({ title: 'Management Override of Controls', desc: 'Higher likelihood of override due to pressure or tone at the top.' });
  }
  if (revNum > 200) {
    riskAreas.push({ title: 'Operational Complexity', desc: `Scale of transactions ($${revenue}M revenue, ${employees} employees) increases audit detection risk.` });
  }

  // Substantive procedures recommendations
  const procedures = [];
  if (industry === 'Technology') {
    procedures.push('Perform contract reviews for multi-element arrangements to verify performance obligation fulfillment under ASC 606.');
  } else if (industry === 'Manufacturing' || industry === 'Retail') {
    procedures.push('Perform physical inventory observation at year-end and test inventory lower-of-cost-or-net-realizable-value (NRV).');
  } else if (industry === 'Financial Services') {
    procedures.push('Utilize valuation specialists to test pricing models and inputs for Level 2 and Level 3 fair-value securities.');
  }
  
  if (controlRating === 'Weak' || priorFindings === 'Material Weakness') {
    procedures.push('Expand sample sizes for substantive detail testing of transactions near the cut-off period.');
    procedures.push('Perform comprehensive journal entry testing, filtering for unusual user roles, timing, or round-sum amounts.');
  } else {
    procedures.push('Perform analytical review procedures comparing current balances with budgeted figures and industry averages.');
  }
  procedures.push('Obtain written management representations regarding control assessments and prior findings.');

  return {
    score,
    category,
    severityColor,
    riskAreas,
    procedures,
    timestamp: new Date().toLocaleDateString(),
    inputs
  };
};

// ==========================================
// 2. FINANCIAL STATEMENT ANALYZER
// ==========================================
export const generateFinancialAnalysis = (statementType) => {
  
  if (statementType === 'Balance Sheet') {
    const data = [
      { account: 'Cash & Cash Equivalents', current: 12500000, prior: 18400000, change: -32.1 },
      { account: 'Accounts Receivable (Net)', current: 19800000, prior: 14200000, change: 39.4 },
      { account: 'Inventory', current: 28400000, prior: 19100000, change: 48.7 },
      { account: 'Prepaid Expenses', current: 1800000, prior: 1500000, change: 20.0 },
      { account: 'Total Current Assets', current: 62500000, prior: 53200000, change: 17.5 },
      { account: 'Property, Plant & Equipment (Net)', current: 45000000, prior: 43000000, change: 4.7 },
      { account: 'Total Assets', current: 107500000, prior: 96200000, change: 11.7 },
      { account: 'Accounts Payable', current: 11200000, prior: 9800000, change: 14.3 },
      { account: 'Short-term Borrowings', current: 15000000, prior: 8000000, change: 87.5 },
      { account: 'Total Current Liabilities', current: 26200000, prior: 17800000, change: 47.2 },
      { account: 'Long-term Debt', current: 32000000, prior: 35000000, change: -8.6 },
      { account: 'Total Liabilities', current: 58200000, prior: 52800000, change: 10.2 },
      { account: "Shareholders' Equity", current: 49300000, prior: 43400000, change: 13.6 },
      { account: 'Total Liabilities & Equity', current: 107500000, prior: 96200000, change: 11.7 }
    ];

    // Ratios
    const currentRatioCurr = (62500000 / 26200000).toFixed(2);
    const currentRatioPrior = (53200000 / 17800000).toFixed(2);
    const quickRatioCurr = ((12500000 + 19800000) / 26200000).toFixed(2);
    const quickRatioPrior = ((18400000 + 14200000) / 17800000).toFixed(2);
    const debtToEquityCurr = (58200000 / 49300000).toFixed(2);
    const debtToEquityPrior = (52800000 / 43400000).toFixed(2);

    const ratios = [
      { name: 'Current Ratio', current: currentRatioCurr, prior: currentRatioPrior, trend: 'Down', status: 'Warning', benchmark: '1.5 - 2.5', desc: 'Measures liquidity. Drop from 2.99 to 2.39 indicates shrinking liquid runway.' },
      { name: 'Quick Ratio (Acid Test)', current: quickRatioCurr, prior: quickRatioPrior, trend: 'Down', status: 'Critical', benchmark: '> 1.0', desc: 'Cash + Receivables relative to current debt. Dropped below 1.5 to 1.23.' },
      { name: 'Debt to Equity Ratio', current: debtToEquityCurr, prior: debtToEquityPrior, trend: 'Down', status: 'Healthy', benchmark: '< 1.5', desc: 'Indicates leverage level. Remains stable around 1.18.' }
    ];

    const anomalies = [
      { title: 'Inventory Surge vs Sales Trend', risk: 'High', message: 'Inventory grew by 48.7% ($9.3M increase), which significantly outpaces normal operating growth. Check for potential obsolete inventory or overvaluation.' },
      { title: 'Liquidity Pressure', risk: 'Medium', message: 'Cash dropped by 32.1% while Short-term Borrowings spiked by 87.5%. The entity is funding operations via short-term debt.' },
      { title: 'Receivables Outpacing Asset Growth', risk: 'Medium', message: 'Accounts Receivable rose 39.4%. Outpaces overall Asset growth of 11.7%. Investigate credit policies and allowance for doubtful accounts.' }
    ];

    return { data, ratios, anomalies };

  } else {
    // Income Statement
    const data = [
      { account: 'Revenue / Sales', current: 84500000, prior: 78000000, change: 8.3 },
      { account: 'Cost of Goods Sold (COGS)', current: 52300000, prior: 46100000, change: 13.4 },
      { account: 'Gross Profit', current: 32200000, prior: 31900000, change: 0.9 },
      { account: 'Sales & Marketing Expenses', current: 12100000, prior: 11500000, change: 5.2 },
      { account: 'General & Admin Expenses', current: 9800000, prior: 8200000, change: 19.5 },
      { account: 'Operating Profit (EBIT)', current: 10300000, prior: 12200000, change: -15.6 },
      { account: 'Interest Expense', current: 2400000, prior: 1500000, change: 60.0 },
      { account: 'Income Tax Expense', current: 1900000, prior: 2400000, change: -20.8 },
      { account: 'Net Income', current: 6000000, prior: 8300000, change: -27.7 }
    ];

    // Ratios
    const grossMarginCurr = ((32200000 / 84500000) * 100).toFixed(1) + '%';
    const grossMarginPrior = ((31900000 / 78000000) * 100).toFixed(1) + '%';
    const netMarginCurr = ((6000000 / 84500000) * 100).toFixed(1) + '%';
    const netMarginPrior = ((8300000 / 78000000) * 100).toFixed(1) + '%';
    const interestCoverageCurr = (10300000 / 2400000).toFixed(2);
    const interestCoveragePrior = (12200000 / 1500000).toFixed(2);

    const ratios = [
      { name: 'Gross Profit Margin', current: grossMarginCurr, prior: grossMarginPrior, trend: 'Down', status: 'Warning', benchmark: '35% - 45%', desc: 'Product profitability margin. Dropped from 40.9% to 38.1% due to COGS rise.' },
      { name: 'Net Profit Margin', current: netMarginCurr, prior: netMarginPrior, trend: 'Down', status: 'Critical', benchmark: '> 8.0%', desc: 'Overall profitability. Dropped from 10.6% to 7.1% (a 27.7% absolute drop in Net Income).' },
      { name: 'Interest Coverage Ratio', current: interestCoverageCurr, prior: interestCoveragePrior, trend: 'Down', status: 'Warning', benchmark: '> 3.0', desc: 'Earnings ability to pay interest. Dropped from 8.13 to 4.29 due to rising debt.' }
    ];

    const anomalies = [
      { title: 'COGS Growth vs Sales Growth', risk: 'High', message: 'COGS rose by 13.4% while sales only rose by 8.3%. Indicates severe margin compression or potential misclassification of operating expenses.' },
      { title: 'Spike in G&A Expenses', risk: 'Medium', message: 'General and Administrative costs increased by 19.5% ($1.6M increase), far exceeding revenue growth. Verify transaction ledgers for abnormal management bonuses or consulting fees.' },
      { title: 'Interest Expense Explosion', risk: 'High', message: 'Interest expenses increased by 60%, driven by short-term borrowings. Check loan agreements, covenants, and verify accounting for interest capitalizations.' }
    ];

    return { data, ratios, anomalies };
  }
};

// ==========================================
// 3. WORKING PAPER GENERATOR
// ==========================================
export const generateWorkingPaper = (area, grade) => {
  const refCode = `WP-${area.toUpperCase().slice(0, 3)}-001`;
  const dateStr = new Date().toLocaleDateString();

  const sections = {
    'Cash': {
      title: 'Cash & Cash Equivalents Lead Schedule',
      objective: 'To verify that cash and bank balances exist, are complete, are owned by the entity, and are correctly valued and disclosed at year-end.',
      procedures: [
        'Obtain year-end bank reconciliation statements for all significant bank accounts.',
        'Send independent bank confirmations directly to all banking institutions under audit.',
        'Review cash cut-off bank statements (minimum 10 days post year-end) for unrecorded deposits or unpresented cheques.',
        'Perform physical count of petty cash balances at year-end.'
      ],
      findings: 'We verified 100% of material bank accounts via third-party confirmation letters received directly from the banks. All bank reconciliations were reviewed and verified. An immaterial cut-off variance of $4,200 was noted and resolved.',
      conclusion: 'Based on the audit procedures performed, we have obtained reasonable assurance that Cash & Cash Equivalents exist, represent the legal property of the company, and are fairly stated in all material respects in accordance with the applicable financial reporting framework.'
    },
    'Inventory': {
      title: 'Inventory Valuation & Count Lead Schedule',
      objective: 'To confirm that inventory exists, is valued at the lower of cost or net realizable value (NRV), is legally owned, and that obsolescence provisions are sufficient.',
      procedures: [
        'Attend physical inventory count at year-end and perform independent test counts.',
        'Trace test counts to final inventory sheets to verify completeness and existence.',
        'Perform inventory price-testing by comparing unit costs to supplier invoices.',
        'Analyze inventory aging reports and test historical obsolescence provision rates against actual write-offs.'
      ],
      findings: 'Inventory count attendance was successful. Some slow-moving stock lines ($245k cost) in warehouse B were identified as having no sales in 6 months. Management has agreed to write these down by 50% to net realizable value.',
      conclusion: 'Subject to the adjustment of $122.5k for slow-moving stock write-downs, inventory balances are physically present, valued appropriately, and present a fair view of inventory holdings at balance sheet date.'
    },
    'Accounts Receivable': {
      title: 'Accounts Receivable Cut-Off & Recoverability',
      objective: 'To verify the valuation, existence, and completeness of accounts receivable and the adequacy of the allowance for credit losses.',
      procedures: [
        'Send positive accounts receivable confirmations to a sample of 25 key debtors.',
        'Perform alternative procedures (subsequent cash receipts test) for non-replies.',
        'Test aging calculations and review the model for Allowance for Doubtful Accounts.',
        'Perform sales cut-off tests for 5 days before and after year-end.'
      ],
      findings: 'Confirmations had a 72% response rate. For non-replies, subsequent cash collections were verified in January. One customer (Debtor 104) went into administration post-year-end; a specific allowance of $180,000 has been proposed.',
      conclusion: 'Based on testing results, except for the proposed adjustment of $180,000 in debtor provisions, accounts receivable are legally enforceable claims, exist, and are valued in line with IFRS 9.'
    },
    'Fixed Assets': {
      title: 'Property, Plant & Equipment Additions & Impairment',
      objective: 'To verify the existence of additions, appropriateness of capitalization criteria, accuracy of depreciation, and check for indicators of asset impairment.',
      procedures: [
        'Vouch a sample of additions to purchase agreements, invoices, and payment proof.',
        'Physically verify a sample of newly acquired assets at main factories.',
        'Perform recalculation of depreciation rates and verify compliance with policy.',
        'Review cash-generating units (CGUs) for indicators of impairment.'
      ],
      findings: 'Sample testing of PP&E additions of $4.2M was clean. Depreciation calculations matched system outputs within a tolerance of 1%. No indicators of asset impairment were identified during factory walkthroughs.',
      conclusion: 'Property, plant, and equipment balances exist, additions are correctly capitalized, and depreciation represents a reasonable allocation of asset values over useful life.'
    },
    'Liabilities': {
      title: 'Search for Unrecorded Liabilities & Debt Covenants',
      objective: 'To ensure all current and non-current liabilities are completely recorded, and that debt covenants are fully complied with.',
      procedures: [
        'Perform a search for unrecorded liabilities by testing subsequent disbursements above $50k in January.',
        'Review board minutes and legal expense ledgers for unrecorded lawsuits or claims.',
        'Obtain bank loan agreements and recalculate financial debt covenants.'
      ],
      findings: 'Our search for unrecorded liabilities tested $1.8M of subsequent cash disbursements. No unrecorded liabilities were discovered. All loan covenant requirements (minimum Current Ratio of 1.5x) were met.',
      conclusion: 'Liabilities are completely recorded. The company complies with its debt covenants, and disclosure of long-term debt matches accounting guidelines.'
    }
  };

  const selected = sections[area] || sections['Cash'];

  return {
    reference: refCode,
    title: selected.title,
    objective: selected.objective,
    procedures: selected.procedures,
    findings: selected.findings,
    conclusion: selected.conclusion,
    meta: {
      preparedBy: `Jane Doe (${grade})`,
      reviewedBy: 'John Smith (Senior Manager)',
      datePrepared: dateStr,
      status: 'Ready for Review'
    }
  };
};

// ==========================================
// 4. AUDIT PROCEDURE GENERATOR
// ==========================================
export const generateAuditProgram = (area, assertions) => {
  
  const baseSteps = {
    'Cash': [
      { step: 1, text: 'Confirm bank balances directly with all banks holding balances.', target: 'Existence' },
      { step: 2, text: 'Verify bank reconciliations by checking bank statement balances and general ledger balances.', target: 'Accuracy' },
      { step: 3, text: 'Perform cash cut-off testing for transactions 5 days before and after year-end.', target: 'Cut-off' },
      { step: 4, text: 'Ensure foreign currency bank balances are converted using the spot exchange rate at reporting date.', target: 'Valuation' }
    ],
    'Inventory': [
      { step: 1, text: 'Observe physical inventory count to ensure stock counts are accurate.', target: 'Existence' },
      { step: 2, text: 'Trace test counts to stock sheets to check that all physical stock is captured.', target: 'Completeness' },
      { step: 3, text: 'Review purchase invoices for inventory items to ensure valuation at cost is correct.', target: 'Valuation' },
      { step: 4, text: 'Perform lower-of-cost-and-NRV tests on inventory items.', target: 'Valuation' }
    ],
    'Accounts Receivable': [
      { step: 1, text: 'Perform debtor confirmations for selected sample of receivables.', target: 'Existence' },
      { step: 2, text: 'Verify cut-off by matching dispatch notes to sales invoices near year-end.', target: 'Cut-off' },
      { step: 3, text: 'Examine subsequent collections to test recoverability.', target: 'Valuation' },
      { step: 4, text: 'Evaluate allowance for credit losses against historic default rates.', target: 'Valuation' }
    ],
    'Fixed Assets': [
      { step: 1, text: 'Inspect physical asset tags for a sample of machine additions.', target: 'Existence' },
      { step: 2, text: 'Review land registry or vehicle titles to prove ownership.', target: 'Rights & Obligations' },
      { step: 3, text: 'Recalculate depreciation expenses to verify calculation accuracy.', target: 'Accuracy' },
      { step: 4, text: 'Test for impairment of fixed assets exhibiting low utilization.', target: 'Valuation' }
    ],
    'Liabilities': [
      { step: 1, text: 'Review bank confirmation replies for unrecorded bank loans.', target: 'Completeness' },
      { step: 2, text: 'Perform subsequent payment testing to ensure invoices were recognized in correct period.', target: 'Completeness' },
      { step: 3, text: 'Read lawyer correspondence files for active legal claims and provision needs.', target: 'Completeness' }
    ]
  };

  const stepsList = baseSteps[area] || baseSteps['Cash'];
  
  // Filter steps based on checked assertions if any are specified, or return all
  const filteredSteps = stepsList.filter(s => {
    if (!assertions || assertions.length === 0) return true;
    // Simple matching
    return assertions.some(a => s.target.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(s.target.toLowerCase()));
  });

  // If filter left us empty, fall back to all steps
  const finalSteps = filteredSteps.length > 0 ? filteredSteps : stepsList;

  return {
    area,
    assertionsSelected: assertions.length > 0 ? assertions : ['All Assertions'],
    steps: finalSteps.map((s, idx) => ({
      id: idx + 1,
      procedure: s.text,
      assertion: s.target,
      sampleSize: Math.floor(Math.random() * 20) + 15,
      evidenceRequired: 'Signed Confirmation, Vouched Invoices, or Calculation Sheets'
    })),
    createdAt: new Date().toLocaleDateString()
  };
};

// ==========================================
// 5. AI COPIILOT CHAT ENGINE
// ==========================================
export const generateCopilotResponse = (message) => {
  const lowercase = message.toLowerCase();
  
  // Custom keyword mappings
  if (lowercase.includes('ifrs 16') || lowercase.includes('lease') || lowercase.includes('leases')) {
    return {
      sender: 'ai',
      text: `### IFRS 16 Leases - Audit Key Considerations
Under **IFRS 16**, lessees must recognize a Right-of-Use (ROU) asset and a lease liability for almost all lease contracts.

**Critical Audit Procedures:**
1. **Completeness Audit:** Verify whether all lease agreements are captured. Vouch lease payments in the General Ledger to contracts and scan rent expenses for unrecorded leases.
2. **Key Inputs Verification:**
   - **Discount Rate:** Check the incremental borrowing rate (IBR) applied against corporate credit terms and loan agreements.
   - **Lease Term:** Verify renewal options or termination options to evaluate management assumptions.
3. **Disclosure Testing:** Ensure correct classification between current and non-current liabilities, interest expense, and depreciation of ROU assets in disclosures.`,
      suggestions: ['Check IFRS 15 Revenue checklist', 'Draft lease audit procedures']
    };
  }
  
  if (lowercase.includes('ifrs 15') || lowercase.includes('revenue') || lowercase.includes('sales')) {
    return {
      sender: 'ai',
      text: `### IFRS 15 Revenue from Contracts with Customers Checklist
IFRS 15 mandates a 5-step model for revenue recognition.

**5-Step Audit Checklist:**
1. **Identify Contract:** Vouch signed agreements to verify legal enforceability.
2. **Identify Performance Obligations:** Check if goods/services are distinct. Look out for bundled software/hardware.
3. **Determine Transaction Price:** Verify volume discounts, rebates, or right-of-return constraints.
4. **Allocate Price:** Recalculate transaction price allocation using Stand-Alone Selling Prices (SSP).
5. **Recognize Revenue:** Test cut-off to ensure control has transferred (point in time vs. over time).`,
      suggestions: ['Generate substantive procedures for Accounts Receivable', 'Search for unrecorded liabilities']
    };
  }

  if (lowercase.includes('sampling') || lowercase.includes('sample size') || lowercase.includes('isa 530')) {
    return {
      sender: 'ai',
      text: `### Audit Sampling Guidelines (ISA 530)
Audit sampling can be statistical or non-statistical.

**Sample Size Planning Factors:**
- **Control Risk & Inherent Risk:** Higher risk = larger samples.
- **Tolerable Misstatement:** Lower tolerable limit = larger samples.
- **Expected Misstatement:** Higher expected error = larger samples or substantive testing.

**General Substantive Testing Rule of Thumb:**
- **High Risk:** 25 - 40 items.
- **Moderate Risk:** 15 - 25 items.
- **Low Risk / System Controls:** 5 - 10 items.
- **Journal Entry Testing:** Run data diagnostics (Benford's Law) to filter before sampling.`,
      suggestions: ['Generate working paper for Inventory', 'Check IFRS 16 audit checklist']
    };
  }

  if (lowercase.includes('inventory') || lowercase.includes('obsolescence') || lowercase.includes('wip')) {
    return {
      sender: 'ai',
      text: `### Inventory Valuation & Count Procedures
Inventory requires high focus due to existence and valuation assertions.

**Recommended Procedures:**
1. **Attendance at Stocktake:** Select items from the floor and count to sheet (completeness) and from sheet to floor (existence).
2. **Cut-off Testing:** Trace the last 5 goods receipt notes (GRNs) and dispatch notes (GDNs) to invoices and verify correct ledger entries.
3. **Net Realizable Value (NRV):** Compare post year-end selling prices with cost of inventory at year-end.
4. **Provision for Obsolescence:** Review stock aging report. Recalculate obsolescence provisions for items aged over 180 days.`,
      suggestions: ['Generate Working Paper for Inventory', 'Audit procedures for Fixed Assets']
    };
  }

  // Fallback engine
  return {
    sender: 'ai',
    text: `### Audit Assistant Insights
I am analyzing your query regarding **"${message}"**. Here are standard professional recommendations:

1. **Assertion Focus:** Depending on the accounts involved, focus testing on **Existence** (overstatements) or **Completeness** (understatements).
2. **Audit Documentation:** Ensure the working paper links clearly to the Lead Schedule and contains:
   - Specific objective of testing
   - Source data description (e.g., "General Ledger at Dec 31")
   - Sample selection methodology
   - Conclusion aligning with audit standards
3. **AI Copilot Tip:** Ask me about specific standards (e.g., "IFRS 16", "IFRS 15", "ISA 530") for structured checklists.`,
    suggestions: ['Check IFRS 16 lease guidelines', 'Check IFRS 15 Revenue checklist', 'Audit sampling guidelines (ISA 530)']
  };
};
