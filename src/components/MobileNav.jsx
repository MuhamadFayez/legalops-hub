import { Menu } from "lucide-react";

const items = [
  ["dashboard", "الرئيسية"],
  ["cases", "القضايا"],
  ["hearings", "الجلسات"],
  ["tasks", "المهام"],
  ["notifications", "التنبيهات"],
  ["reports", "التقارير"],
];

export default function MobileNav({ activePage, onNavigate }) {
  return (
    <div className="border-b border-slate-200 bg-legal-navy p-3 text-white lg:hidden">
      <div className="mb-3 flex items-center gap-2 font-bold">
        <Menu className="h-5 w-5 text-legal-gold" />
        LegalOps Hub
      </div>
      <div className="grid grid-cols-6 gap-2">
        {items.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`h-10 rounded-md text-[11px] font-bold ${activePage === key ? "bg-legal-gold" : "bg-white/10"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
