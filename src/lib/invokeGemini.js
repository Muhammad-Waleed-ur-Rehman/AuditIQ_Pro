import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Reusable helper to invoke the 'gemini-audit' Supabase Edge Function.
 * Standardizes request body, logging, and error handling.
 * 
 * @param {Object} options - Request options
 * @param {string} options.mode - AI mode (e.g., 'audit_chat', 'working_paper')
 * @param {string} options.prompt - The main user input or instruction
 * @param {Object} [options.projectContext] - Optional context about the active audit project
 * @param {Object} [options.additionalData] - Any extra data needed for specific modes
 * @returns {Promise<any>} - The 'result' field from the function response
 */
export async function invokeGemini({ mode, prompt, projectContext, additionalData }) {
  console.log(`[invokeGemini] Mode: ${mode}`, { prompt, projectContext, additionalData });

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('gemini-audit', {
      body: {
        mode,
        prompt: prompt || '',
        projectContext: projectContext || null,
        additionalData: additionalData || null,
      },
    });

    if (error) {
      // supabase-js returns an error object for non-2xx status codes
      console.error(`[invokeGemini] Edge Function Error (Status ${error.status}):`, error);
      
      // Attempt to extract details from the response if available
      let detailMsg = '';
      try {
        const body = await error.context?.json?.();
        detailMsg = body?.error || body?.details || '';
      } catch {
        // Body might not be JSON or already consumed
      }

      throw new Error(detailMsg || error.message || 'The AI service returned an error. Please check your Supabase logs.');
    }

    // Handle application-level errors returned in the 200 response body (if any)
    if (data?.error) {
      console.error('[invokeGemini] Application Error:', data.error);
      throw new Error(data.error + (data.details ? `: ${JSON.stringify(data.details)}` : ''));
    }

    return data?.result;
  } catch (err) {
    console.error('[invokeGemini] Unexpected Failure:', err);
    throw err;
  }
}
