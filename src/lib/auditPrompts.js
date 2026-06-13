export function buildManagementLetterPrompt(observation) {
  return `Create a professional management letter draft for the following audit observation. Return valid JSON with keys: observation, risk, recommendation, managementResponseTemplate, priority. The wording should be concise, audit-ready, and suitable for a qualified auditor to review. Observation: ${observation}`;
}

export function buildPlanningMemoPrompt({ clientBackground, auditType, industry, keyRisks, financialRedFlags, internalControlConcerns }) {
  return `Create an audit planning memo in valid JSON with keys: clientBackground, auditScope, keyRisks (array), materialityConsiderations, auditStrategy, teamPlanningNotes, timelineConsiderations. Use the following context: Client background: ${clientBackground}; Audit type: ${auditType}; Industry: ${industry}; Key risks: ${keyRisks}; Financial red flags: ${financialRedFlags}; Internal control concerns: ${internalControlConcerns}. Use cautious professional wording and auditor review guidance.`;
}

export function buildRedFlagExplanationPrompt(redFlags, ratios) {
  return `Explain the following financial red flags using audit-safe language. Return valid JSON with keys: summary and redFlagAnalysis (array of objects with redFlag, possibleCauses, auditImplications, recommendedProcedures, severity). Financial red flags: ${JSON.stringify(redFlags)}. Ratio data: ${JSON.stringify(ratios)}.`;
}

export function buildKnowledgeHubPrompt(question) {
  return `You are an audit knowledge assistant. Answer the user's question with professional, cautious guidance for auditors. Do not present unsupported claims. Include relevant assertions, risks, and suggested procedures when appropriate. User question: ${question}`;
}

export function buildPromptLibrarySuggestions() {
  return [
    { title: 'Risk Assessment Starter', category: 'Risk Assessment', promptText: 'Assess the key financial and control risks for this engagement and highlight the top three areas for substantive testing.' },
    { title: 'Working Paper Summary', category: 'Working Papers', promptText: 'Draft a concise audit working paper summary covering the observation, criteria, condition, cause, effect, and recommendation.' },
    { title: 'Management Letter Draft', category: 'Management Letters', promptText: 'Prepare a management letter draft that explains the observation, the associated risk, and practical recommendations.' },
    { title: 'Planning Memo Outline', category: 'Planning Memo', promptText: 'Create an audit planning memo for this client including scope, materiality considerations, key risks, and team notes.' },
    { title: 'Red Flags Review', category: 'Financial Analysis', promptText: 'Explain the financial red flags in plain audit language and identify likely causes, audit implications, and procedures.' },
  ];
}
