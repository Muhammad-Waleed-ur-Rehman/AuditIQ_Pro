import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Strict Audit Safety Rules to be included in every system prompt.
 * These rules ensure the AI behaves as a cautious assistant, not a primary auditor.
 */
const AUDIT_SAFETY_RULES = `
AUDIT SAFETY & PROFESSIONAL RULES:
1. Do not issue final audit opinions (Unmodified, Qualified, etc.).
2. Do not conclude that fraud has occurred without absolute evidence; use terms like "potential indicators" or "red flags".
3. Do not fabricate standards, laws, or citations. If unsure, refer to "applicable professional standards".
4. Use cautious, professional, and objective auditor wording.
5. Always imply that AI-generated outputs are for assistance only and must be reviewed by a qualified auditor.
`;

/**
 * Helper to strip markdown code fences (e.g., ```json ... ```) from responses.
 */
function stripCodeFences(text: string): string {
  return text.replace(/```json|```/gi, '').trim();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  let body: any = {};
  try {
    body = await req.json().catch(() => ({}));
    const { mode, prompt: rawPrompt, projectContext, additionalData } = body;
    
    // Ensure prompt is a string and handle undefined/null
    const prompt = (rawPrompt || '').toString();

    // 1. Retrieve API key from Supabase secrets
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
      console.error("GROQ_API_KEY is not configured in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is not configured in Supabase secrets." }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const modeValue = typeof mode === 'string' ? mode.trim().toLowerCase() : '';
    let systemPrompt = '';
    let isJsonResponse = false;

    /**
     * Define Mode-Specific System Prompts
     */
    if (modeValue === 'working_paper') {
      isJsonResponse = true;
      systemPrompt = `You are an experienced audit manager. Convert the user audit observation into a professional working paper format. Return valid JSON only: { "criteria": "", "condition": "", "cause": "", "effect": "", "recommendation": "", "riskRating": "Low|Medium|High" } ${AUDIT_SAFETY_RULES}`;
    } else if (modeValue === 'audit_procedure') {
      isJsonResponse = true;
      systemPrompt = `You are a technical audit specialist. Generate substantive audit procedures. Return valid JSON only: { "assertions": ["assertion1", "assertion2"], "procedures": ["procedure1", "procedure2"], "evidenceRequired": ["evidence1", "evidence2"], "samplingApproach": "judgmental/statistical" } ${AUDIT_SAFETY_RULES}`;
    } else if (modeValue === 'management_letter') {
      isJsonResponse = true;
      systemPrompt = `You are an audit manager drafting a formal management letter. Return valid JSON only: { "observation": "", "risk": "", "recommendation": "", "managementResponseTemplate": "", "priority": "High|Medium|Low" } ${AUDIT_SAFETY_RULES}`;
    } else if (modeValue === 'planning_memo') {
      isJsonResponse = true;
      systemPrompt = `You are an audit planning specialist. Draft a planning memo. Return valid JSON only: { "clientBackground": "", "auditScope": "", "keyRisks": ["risk1", "risk2"], "materialityConsiderations": "", "auditStrategy": "", "teamPlanningNotes": "", "timelineConsiderations": "" } ${AUDIT_SAFETY_RULES}`;
    } else if (modeValue === 'red_flag_explanation') {
      isJsonResponse = true;
      systemPrompt = `You are an audit analytics assistant. Explain financial red flags. Return valid JSON only: { "summary": "", "redFlagAnalysis": [ { "redFlag": "", "possibleCauses": [], "auditImplications": [], "recommendedProcedures": [], "severity": "Low|Medium|High" } ] } ${AUDIT_SAFETY_RULES}`;
    } else if (modeValue === 'knowledge_hub') {
      systemPrompt = `You are AuditIQ Pro, a knowledge assistant for auditors. Format your response with clear headings and bullet points. ${AUDIT_SAFETY_RULES}`;
    } else if (modeValue === 'audit_chat') {
      systemPrompt = `You are AuditIQ Pro, an AI audit copilot. Answer technical audit questions professionally. Use bullet points for readability. ${AUDIT_SAFETY_RULES}`;
    } else {
      console.error("Invalid or missing mode:", modeValue);
      return new Response(
        JSON.stringify({ error: "Invalid or missing mode", receivedMode: modeValue }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const contextStr = projectContext ? JSON.stringify(projectContext, null, 2) : 'None provided.';
    const dataStr = additionalData ? JSON.stringify(additionalData, null, 2) : 'None provided.';

    const fullPrompt = `
PROJECT CONTEXT:
${contextStr}

ADDITIONAL DATA:
${dataStr}

USER REQUEST:
${prompt}
`;

    // Call Groq API (OpenAI compatible)
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: fullPrompt
            }
          ],
          temperature: 0.3
        })
      }
    );

    if (!groqResponse.ok) {
      const err = await groqResponse.json().catch(() => ({}));
      console.error("Groq API Error:", err);
      return new Response(
        JSON.stringify({ error: 'Groq API failure.', details: err }),
        {
          status: groqResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await groqResponse.json();
    const textResult = data?.choices?.[0]?.message?.content || "";
    
    if (!textResult) {
      console.error("Groq returned no content:", data);
      return new Response(
        JSON.stringify({ error: "Groq returned no content", raw: data }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (isJsonResponse) {
      const cleaned = stripCodeFences(textResult);
      try {
        const parsed = JSON.parse(cleaned);
        return new Response(
          JSON.stringify({ result: parsed }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      } catch (e) {
        console.warn("JSON parsing failed, returning raw text:", textResult);
        return new Response(
          JSON.stringify({ result: textResult, isRaw: true, parseError: String(e) }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
    }

    return new Response(
      JSON.stringify({ result: textResult }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error("Function error:", error);
    console.error("Request body:", body);
    return new Response(
      JSON.stringify({ error: 'Unexpected server error.', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
