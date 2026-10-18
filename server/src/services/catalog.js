import { supabase } from '../config/supabase.js';
export async function visibleCategorySlugs() {
  const { data, error } = await supabase.from('categories').select('id,slug,parent_id').eq('is_active', true);
  if (error) throw error;
  const roots = new Set(data.filter(c => !c.parent_id).map(c => c.id));
  return data.filter(c => !c.parent_id || roots.has(c.parent_id)).map(c => c.slug);
}
