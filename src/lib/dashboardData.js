import { supabase, isSupabaseConfigured, getSupabaseErrorMessage } from './supabaseClient';

export async function fetchActiveEngagements(userId) {
  if (!isSupabaseConfigured || !supabase) return [];
  if (!userId) throw new Error('User not authenticated');
  try {
    const { data, error } = await supabase
      .from('audit_projects')
      .select('id, project_name, client_name, audit_type, industry, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const active = (data || []).filter(
      p => !p.status || p.status !== 'completed'
    );
    return active;
  } catch (err) {
    console.warn('Failed to load engagements:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function fetchProjectRiskScores(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return {};
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('project_id, risk_score, risk_level, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const latest = {};
    for (const r of data || []) {
      if (!latest[r.project_id]) {
        latest[r.project_id] = { score: r.risk_score, level: r.risk_level, created_at: r.created_at };
      }
    }
    return latest;
  } catch (err) {
    console.warn('Failed to load risk scores:', err);
    return {};
  }
}

export async function fetchHighRiskCount(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return 0;
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('risk_level, significant_risk')
      .eq('user_id', userId);
    if (error) throw error;
    if (!data) return 0;
    const highCount = data.filter(
      r => r.risk_level === 'High' || r.significant_risk === true
    ).length;
    return highCount;
  } catch (err) {
    console.warn('Failed to count high risks:', err);
    return 0;
  }
}

export async function fetchLatestRiskScore(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('risk_score, risk_level')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      return `${data[0].risk_level} (${data[0].risk_score})`;
    }
    return null;
  } catch (err) {
    console.warn('Failed to load latest risk score:', err);
    return null;
  }
}

export async function fetchAllRiskAssessments(userId) {
  if (!isSupabaseConfigured || !supabase) return [];
  if (!userId) throw new Error('User not authenticated');
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to load risk assessments:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function fetchProjectsCount(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return 0;
  try {
    const { count, error } = await supabase
      .from('audit_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.warn('Failed to count projects:', err);
    return 0;
  }
}

export async function fetchActiveEngagementsCount(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return 0;
  try {
    const { data, error } = await supabase
      .from('audit_projects')
      .select('status')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).filter(p => !p.status || p.status !== 'completed').length;
  } catch (err) {
    console.warn('Failed to count active engagements:', err);
    return 0;
  }
}

export async function fetchProjectRiskAssessments(userId, projectId) {
  if (!isSupabaseConfigured || !supabase) return [];
  if (!userId) throw new Error('User not authenticated');
  if (!projectId) return [];
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to load project risk assessments:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function fetchAiQueriesCount(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return 0;
  try {
    const { count, error } = await supabase
      .from('ai_chat_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.warn('Failed to count AI queries:', err);
    return 0;
  }
}
