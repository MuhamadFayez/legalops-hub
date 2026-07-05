const statusMap = {
  "نشطة": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "قيد المراجعة": "bg-amber-50 text-amber-700 border-amber-200",
  "مكتمل": "bg-slate-100 text-slate-700 border-slate-200",
  "جديد": "bg-blue-50 text-blue-700 border-blue-200",
  "قيد العمل": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "بانتظار مراجعة": "bg-amber-50 text-amber-700 border-amber-200",
  "متأخر": "bg-red-50 text-red-700 border-red-200",
  "عالية": "bg-red-50 text-red-700 border-red-200",
  "متوسطة": "bg-amber-50 text-amber-700 border-amber-200",
  "منخفضة": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "جاهز": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "بحاجة مراجعة": "bg-red-50 text-red-700 border-red-200",
  "قيد التحضير": "bg-blue-50 text-blue-700 border-blue-200",
};

export function badgeClass(value) {
  return statusMap[value] ?? "bg-slate-50 text-slate-700 border-slate-200";
}
