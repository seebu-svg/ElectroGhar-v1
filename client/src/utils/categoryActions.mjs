export function sortCategories(categories) {
  return [...categories].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.id.localeCompare(b.id));
}

export function categoryMoveUpdates(categories, category, direction) {
  if (direction !== -1 && direction !== 1) return [];
  const siblings = sortCategories(categories.filter(item => (item.parent_id || null) === (category.parent_id || null)));
  const index = siblings.findIndex(item => item.id === category.id);
  const neighbor = siblings[index + direction];
  if (index < 0 || !neighbor) return [];
  if (new Set(siblings.map(item => Number(item.sort_order || 0))).size === siblings.length) {
    return [{ id: category.id, sort_order: Number(neighbor.sort_order || 0) }, { id: neighbor.id, sort_order: Number(siblings[index].sort_order || 0) }];
  }
  // Older categories can share a position. Normalize only when a swap cannot
  // distinguish the two rows, and leave already-correct siblings untouched.
  [siblings[index], siblings[index + direction]] = [siblings[index + direction], siblings[index]];
  return siblings.flatMap((item, position) => Number(item.sort_order || 0) === position ? [] : [{ id: item.id, sort_order: position }]);
}

export async function saveCategoryMove(categories, category, direction, request) {
  const updates = categoryMoveUpdates(categories, category, direction);
  // Rows are independent. Wait for every write, including failures, before the
  // caller reconciles with the server so no late write races that reload.
  const results = await Promise.allSettled(updates.map(({ id, sort_order }) => request(`/categories/${id}`, 'PUT', { sort_order })));
  const failure = results.find(result => result.status === 'rejected');
  if (failure) throw failure.reason;
  const saved = new Map(results.map(result => [result.value.category.id, result.value.category]));
  return sortCategories(categories.map(item => saved.get(item.id) || item));
}
