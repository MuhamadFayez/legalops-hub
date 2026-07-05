import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileArchive,
  Home,
  Users,
  UserRound,
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "لوحة التحكم", icon: Home },
  { key: "cases", label: "القضايا", icon: BriefcaseBusiness },
  { key: "calendar", label: "التقويم", icon: CalendarCheck },
  { key: "hearings", label: "الجلسات", icon: CalendarDays },
  { key: "tasks", label: "المهام", icon: ClipboardList },
  { key: "notifications", label: "التنبيهات", icon: BellRing },
  { key: "employees", label: "الموظفون", icon: Users },
  { key: "clients", label: "العملاء", icon: UserRound },
  { key: "documents", label: "المستندات", icon: FileArchive },
  { key: "reports", label: "التقارير", icon: BarChart3 },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-20 hidden w-72 border-l border-white/10 bg-legal-navy text-white lg:block">
      <div className="px-6 py-7">
        <div className="border-b border-white/10 pb-6">
          <p className="text-2xl font-bold">LegalOps Hub</p>
          <p className="mt-2 text-sm text-slate-300">إدارة عمليات مكتب المحاماة</p>
        </div>
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex h-12 w-full items-center gap-3 rounded-md px-4 text-right text-sm font-semibold transition ${
                  isActive ? "bg-legal-gold text-white" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
