import { CalendarDays, CheckCircle2, ClipboardX, Scale } from "lucide-react";

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="surface p-5">
      <Icon className="h-6 w-6 text-legal-gold" />
      <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-legal-navy">{value}</p>
    </div>
  );
}

function BarList({ title, rows }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="surface p-5">
      <h2 className="mb-4 text-lg font-bold text-legal-navy">{title}</h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold">{row.label}</span>
              <span className="text-slate-500">{row.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-legal-gold" style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function groupByCount(items, keyGetter) {
  return Object.values(
    items.reduce((acc, item) => {
      const key = keyGetter(item);
      acc[key] = acc[key] ?? { label: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {})
  );
}

export default function ReportsPage({ data }) {
  const completed = data.tasks.filter((item) => item.status === "مكتمل").length;
  const completionRate = Math.round((completed / data.tasks.length) * 100);
  const overdue = data.tasks.filter((item) => item.status === "متأخر").length;
  const upcoming = data.hearings.filter((item) => item.date >= "2026-07-04").length;
  const casesByType = groupByCount(data.cases, (item) => item.type);
  const casesByLawyer = groupByCount(data.cases, (item) => data.employees.find((employee) => employee.id === item.ownerId)?.name ?? "غير محدد");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="معدل إنجاز المهام" value={`${completionRate}%`} icon={CheckCircle2} />
        <Metric label="إجمالي القضايا" value={data.cases.length} icon={Scale} />
        <Metric label="المهام المتأخرة" value={overdue} icon={ClipboardX} />
        <Metric label="الجلسات القادمة" value={upcoming} icon={CalendarDays} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <BarList title="القضايا حسب النوع" rows={casesByType} />
        <BarList title="القضايا حسب المحامي" rows={casesByLawyer} />
      </div>
    </div>
  );
}
