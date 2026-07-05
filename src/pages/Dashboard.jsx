import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  FileArchive,
  LayoutDashboard,
  RefreshCw,
  Scale,
  Settings2,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import { getCaseName, getEmployeeName, isOverdue, today } from "../utils/formatters";

const WIDGET_STORAGE_KEY = "legalops-dashboard-widgets";

const defaultVisibleWidgets = [
  "summary",
  "taskDistribution",
  "todayHearings",
  "overdueTasks",
  "highRiskCases",
  "caseTypes",
  "taskStatus",
  "upcomingHearings",
];

function loadVisibleWidgets() {
  try {
    const stored = JSON.parse(localStorage.getItem(WIDGET_STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : defaultVisibleWidgets;
  } catch {
    return defaultVisibleWidgets;
  }
}

function saveVisibleWidgets(widgetIds) {
  localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(widgetIds));
}

function WidgetShell({ title, icon: Icon, children, actions, className = "" }) {
  return (
    <section className={`surface min-h-48 p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-legal-gold" />
          <h2 className="text-base font-bold text-legal-navy">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function StatTile({ label, value, icon: Icon, tone = "navy", hint }) {
  const toneClass = tone === "danger" ? "bg-red-50 text-red-700" : tone === "gold" ? "bg-legal-softGold text-legal-gold" : "bg-slate-100 text-legal-navy";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-legal-navy">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function BarRow({ label, value, max, danger }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-bold">{label}</span>
        <span className={danger ? "font-bold text-red-700" : "text-slate-500"}>{value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${danger ? "bg-red-500" : "bg-legal-gold"}`} style={{ width: `${Math.max(8, (value / Math.max(1, max)) * 100)}%` }} />
      </div>
    </div>
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

export default function Dashboard({ data }) {
  const [visibleWidgets, setVisibleWidgets] = useState(loadVisibleWidgets);
  const [showSettings, setShowSettings] = useState(false);
  const [taskOwnerFilter, setTaskOwnerFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const activeCases = data.cases.filter((item) => item.status === "نشطة");
  const todayHearings = data.hearings.filter((item) => item.date === today);
  const overdueTasks = data.tasks.filter(isOverdue);
  const highRiskCases = data.cases.filter((item) => item.risk === "عالية");
  const completedTasks = data.tasks.filter((item) => item.status === "مكتمل").length;
  const completionRate = Math.round((completedTasks / Math.max(1, data.tasks.length)) * 100);

  const upcomingHearings = [...data.hearings].filter((item) => item.date >= today).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const caseTypeRows = groupByCount(data.cases, (item) => item.type);
  const taskStatusRows = groupByCount(data.tasks, (item) => item.status);
  const documentStatusRows = groupByCount(data.documents, (item) => item.status);

  const filteredTasks = taskOwnerFilter === "all" ? data.tasks : data.tasks.filter((task) => task.assigneeId === taskOwnerFilter);
  const visibleRiskCases = riskFilter === "all" ? data.cases : data.cases.filter((item) => item.risk === riskFilter);

  const widgets = useMemo(
    () => [
      {
        id: "summary",
        title: "المؤشرات السريعة",
        icon: LayoutDashboard,
        span: "xl:col-span-2",
        render: () => (
          <WidgetShell title="المؤشرات السريعة" icon={LayoutDashboard} className="xl:col-span-2">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatTile label="القضايا النشطة" value={activeCases.length} icon={Scale} hint="قضايا تحتاج متابعة يومية" />
              <StatTile label="جلسات اليوم" value={todayHearings.length} icon={CalendarCheck} tone="gold" hint={today} />
              <StatTile label="المهام المتأخرة" value={overdueTasks.length} icon={ClipboardList} tone="danger" hint="تظهر تلقائيًا حسب تاريخ الاستحقاق" />
              <StatTile label="نسبة إنجاز المهام" value={`${completionRate}%`} icon={CheckCircle2} hint={`${completedTasks} من ${data.tasks.length} مكتملة`} />
            </div>
          </WidgetShell>
        ),
      },
      {
        id: "taskDistribution",
        title: "توزيع المهام على الموظفين",
        icon: UsersRound,
        span: "xl:col-span-2",
        render: () => {
          const rows = data.employees.map((employee) => ({
            label: employee.name,
            value: data.tasks.filter((task) => task.assigneeId === employee.id && task.status !== "مكتمل").length,
          }));
          const max = Math.max(1, ...rows.map((row) => row.value));
          return (
            <WidgetShell title="توزيع المهام على الموظفين" icon={UsersRound} className="xl:col-span-2">
              <div className="space-y-4">
                {rows.map((row) => (
                  <BarRow key={row.label} label={row.label} value={row.value} max={max} />
                ))}
              </div>
            </WidgetShell>
          );
        },
      },
      {
        id: "todayHearings",
        title: "جلسات اليوم",
        icon: CalendarCheck,
        render: () => (
          <WidgetShell title="جلسات اليوم" icon={CalendarCheck}>
            <div className="space-y-3">
              {todayHearings.length ? (
                todayHearings.map((hearing) => (
                  <div key={hearing.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="font-bold text-legal-navy">{hearing.time} - {getCaseName(data.cases, hearing.caseId)}</p>
                    <p className="mt-1 text-xs text-slate-500">{hearing.court}</p>
                    <div className="mt-2"><Badge value={hearing.preparation} /></div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">لا توجد جلسات مجدولة اليوم.</p>
              )}
            </div>
          </WidgetShell>
        ),
      },
      {
        id: "overdueTasks",
        title: "المهام المتأخرة",
        icon: AlertTriangle,
        render: () => (
          <WidgetShell
            title="المهام المتأخرة"
            icon={AlertTriangle}
            actions={
              <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none" value={taskOwnerFilter} onChange={(event) => setTaskOwnerFilter(event.target.value)}>
                <option value="all">كل المسؤولين</option>
                {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
            }
          >
            <div className="space-y-3">
              {filteredTasks.filter(isOverdue).map((task) => (
                <div key={task.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="font-bold text-red-800">{task.title}</p>
                  <p className="mt-1 text-xs text-red-700">{getCaseName(data.cases, task.caseId)}</p>
                  <p className="mt-1 text-xs text-red-600">المسؤول: {getEmployeeName(data.employees, task.assigneeId)} | الاستحقاق: {task.dueDate}</p>
                </div>
              ))}
              {filteredTasks.filter(isOverdue).length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">لا توجد مهام متأخرة لهذا الاختيار.</p>}
            </div>
          </WidgetShell>
        ),
      },
      {
        id: "highRiskCases",
        title: "تنبيهات المخاطر",
        icon: AlertTriangle,
        render: () => (
          <WidgetShell
            title="تنبيهات المخاطر"
            icon={AlertTriangle}
            actions={
              <select className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                <option value="all">كل المخاطر</option>
                <option>عالية</option>
                <option>متوسطة</option>
                <option>منخفضة</option>
              </select>
            }
          >
            <div className="space-y-3">
              {visibleRiskCases.map((item) => (
                <div key={item.id} className={`rounded-lg border p-3 ${item.risk === "عالية" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={item.risk === "عالية" ? "font-bold text-red-800" : "font-bold text-legal-navy"}>{item.number}</p>
                    <Badge value={item.risk} />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.clientName}</p>
                  <p className="mt-1 text-xs text-slate-500">المسؤول: {getEmployeeName(data.employees, item.ownerId)}</p>
                </div>
              ))}
            </div>
          </WidgetShell>
        ),
      },
      {
        id: "caseTypes",
        title: "القضايا حسب النوع",
        icon: BarChart3,
        render: () => {
          const max = Math.max(1, ...caseTypeRows.map((row) => row.value));
          return (
            <WidgetShell title="القضايا حسب النوع" icon={BarChart3}>
              <div className="space-y-4">
                {caseTypeRows.map((row) => <BarRow key={row.label} label={row.label} value={row.value} max={max} />)}
              </div>
            </WidgetShell>
          );
        },
      },
      {
        id: "taskStatus",
        title: "حالة المهام",
        icon: ClipboardList,
        render: () => {
          const max = Math.max(1, ...taskStatusRows.map((row) => row.value));
          return (
            <WidgetShell title="حالة المهام" icon={ClipboardList}>
              <div className="space-y-4">
                {taskStatusRows.map((row) => <BarRow key={row.label} label={row.label} value={row.value} max={max} danger={row.label === "متأخر"} />)}
              </div>
            </WidgetShell>
          );
        },
      },
      {
        id: "upcomingHearings",
        title: "الجلسات القادمة",
        icon: CalendarCheck,
        render: () => (
          <WidgetShell title="الجلسات القادمة" icon={CalendarCheck}>
            <div className="space-y-3">
              {upcomingHearings.slice(0, 5).map((hearing) => (
                <div key={hearing.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="font-bold text-legal-navy">{hearing.date} - {hearing.time}</p>
                    <p className="mt-1 text-xs text-slate-500">{getCaseName(data.cases, hearing.caseId)}</p>
                  </div>
                  <Badge value={hearing.preparation} />
                </div>
              ))}
            </div>
          </WidgetShell>
        ),
      },
      {
        id: "documents",
        title: "حالة المستندات",
        icon: FileArchive,
        render: () => {
          const max = Math.max(1, ...documentStatusRows.map((row) => row.value));
          return (
            <WidgetShell title="حالة المستندات" icon={FileArchive}>
              <div className="space-y-4">
                {documentStatusRows.map((row) => <BarRow key={row.label} label={row.label} value={row.value} max={max} danger={row.label === "ناقص"} />)}
              </div>
            </WidgetShell>
          );
        },
      },
      {
        id: "teamLoad",
        title: "ضغط العمل على الفريق",
        icon: UserCheck,
        render: () => (
          <WidgetShell title="ضغط العمل على الفريق" icon={UserCheck}>
            <div className="space-y-3">
              {data.employees.map((employee) => (
                <div key={employee.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-legal-navy">{employee.name}</p>
                    <Badge value={employee.role} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{employee.cases} قضايا | {employee.openTasks} مهام مفتوحة | {employee.weeklyHearings} جلسات أسبوعية</p>
                </div>
              ))}
            </div>
          </WidgetShell>
        ),
      },
    ],
    [caseTypeRows, completedTasks, completionRate, data, documentStatusRows, filteredTasks, highRiskCases.length, overdueTasks.length, riskFilter, taskOwnerFilter, taskStatusRows, todayHearings, upcomingHearings, visibleRiskCases]
  );

  const visibleSet = new Set(visibleWidgets);
  const renderedWidgets = widgets.filter((widget) => visibleSet.has(widget.id));

  function toggleWidget(widgetId) {
    const next = visibleSet.has(widgetId) ? visibleWidgets.filter((id) => id !== widgetId) : [...visibleWidgets, widgetId];
    setVisibleWidgets(next);
    saveVisibleWidgets(next);
  }

  function resetWidgets() {
    setVisibleWidgets(defaultVisibleWidgets);
    saveVisibleWidgets(defaultVisibleWidgets);
  }

  return (
    <div className="space-y-5">
      <section className="surface p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-legal-navy">لوحة قابلة للتخصيص</h2>
            <p className="mt-1 text-sm text-slate-500">اختر الويدجت التي تريد ظهورها، وسيتم حفظ اختيارك تلقائيًا.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setShowSettings((value) => !value)}>
              <Settings2 className="h-4 w-4" />
              اختيار الويدجت
            </button>
            <button className="btn-secondary" onClick={resetWidgets}>
              <RefreshCw className="h-4 w-4" />
              الافتراضي
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
            {widgets.map((widget) => {
              const isVisible = visibleSet.has(widget.id);
              const Icon = isVisible ? Eye : EyeOff;
              return (
                <button
                  key={widget.id}
                  className={`flex h-12 items-center justify-between rounded-md border px-3 text-sm font-bold transition ${
                    isVisible ? "border-legal-gold bg-legal-softGold text-legal-navy" : "border-slate-200 bg-white text-slate-500"
                  }`}
                  onClick={() => toggleWidget(widget.id)}
                >
                  <span>{widget.title}</span>
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {renderedWidgets.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {renderedWidgets.map((widget) => (
            <div key={widget.id} className={widget.span ?? ""}>
              {widget.render()}
            </div>
          ))}
        </div>
      ) : (
        <section className="surface p-8 text-center">
          <p className="font-bold text-legal-navy">لم يتم اختيار أي ويدجت للعرض.</p>
          <button className="btn-primary mt-4" onClick={resetWidgets}>استعادة الويدجت الافتراضية</button>
        </section>
      )}
    </div>
  );
}
