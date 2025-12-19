import { Task } from "@/types/task";

/**
 * 日付を正規化（時分秒を0に設定）
 * @param date 
 * @returns 正規化された日付
 */
export function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * 期限日フィルタリングを適用 (true: 該当, false: 非該当)
 * @param tasks
 * @param dueFilters
 * @returns フィルタリング結果のboolean配列
 */
export function applyDueDateFilters(tasks: Task[], dueFilters: string[]) {
  if (dueFilters.length === 0) return tasks;

  const today = normalizeDate(new Date());
  const fiveDaysLater = normalizeDate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
  );

  return tasks.filter(task => {
    if (!task.due_date) return false;

    const d = normalizeDate(new Date(task.due_date));

    const overdue = dueFilters.includes("overdue");
    const dueSoon = dueFilters.includes("due_soon");

    if (overdue && !dueSoon) return d < today;
    if (dueSoon && !overdue) return d >= today && d <= fiveDaysLater;
    if (overdue && dueSoon) return d < today || (d >= today && d <= fiveDaysLater);

    return true;
  });
}
