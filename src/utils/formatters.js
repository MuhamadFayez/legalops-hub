export const today = "2026-07-05";

export function byId(items, id) {
  return items.find((item) => item.id === id);
}

export function isOverdue(task) {
  return task.status !== "مكتمل" && task.dueDate < today;
}

export function getCaseName(cases, caseId) {
  const found = byId(cases, caseId);
  return found ? `${found.number} - ${found.clientName}` : "قضية غير معروفة";
}

export function getEmployeeName(employees, employeeId) {
  return byId(employees, employeeId)?.name ?? "غير محدد";
}

export function matchesSearch(item, query) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return Object.values(item).some((value) => String(value).toLowerCase().includes(needle));
}
