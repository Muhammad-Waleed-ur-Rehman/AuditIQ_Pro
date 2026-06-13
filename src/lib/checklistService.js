import { supabase, isSupabaseConfigured, getSupabaseErrorMessage } from './supabaseClient';

export async function fetchChecklistItems(userId, projectId) {
  if (!isSupabaseConfigured || !supabase) return [];
  if (!userId) throw new Error('User not authenticated');
  try {
    let query = supabase
      .from('audit_checklists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to load checklist items:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function addChecklistItem(userId, projectId, title, category = 'Planning', dueDate = null) {
  if (!isSupabaseConfigured || !supabase) return null;
  if (!userId) throw new Error('User not authenticated');
  if (!title || !title.trim()) throw new Error('Title is required');
  try {
    const payload = {
      user_id: userId,
      project_id: projectId || null,
      title: title.trim(),
      category,
      is_completed: false,
      priority: 'Medium'
    };
    if (dueDate) payload.due_date = dueDate;

    const { data, error } = await supabase
      .from('audit_checklists')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.warn('Failed to add checklist item:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function toggleChecklistItem(id, currentCompleted) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const updates = { is_completed: !currentCompleted };
    if (!currentCompleted) {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = null;
    }
    const { error } = await supabase
      .from('audit_checklists')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to toggle checklist item:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function deleteChecklistItem(id) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('audit_checklists')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to delete checklist item:', err);
    throw new Error(getSupabaseErrorMessage(err));
  }
}

export async function updateChecklistCategory(id, category) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('audit_checklists')
      .update({ category })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Failed to update checklist category:', err);
    return false;
  }
}

export async function fetchChecklistStats(userId, projectId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { total: 0, completed: 0, progress: 0 };
  }
  try {
    let query = supabase
      .from('audit_checklists')
      .select('is_completed', { count: 'exact' })
      .eq('user_id', userId);
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    const total = count ?? data?.length ?? 0;
    const completed = data?.filter(i => i.is_completed).length ?? 0;
    return {
      total,
      completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  } catch (err) {
    console.warn('Failed to fetch checklist stats:', err);
    return { total: 0, completed: 0, progress: 0 };
  }
}
