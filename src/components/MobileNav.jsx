import { Menu } from "lucide-react";

const items = [
  ["dashboard", "الرئيسية"],
  ["cases", "القضايا"],
  ["calendar", "التقويم"],
  ["timeline", "التسلسل"],
  ["bookings", "الحجوزات"],
  ["tasks", "المهام"],
  ["notifications", "التنبيهات"],
  ["governance", "الحوكمة"],
  ["reports", "التقارير"],
];

export default function MobileNav({ activePage, onNavigate }) {
  return (
    <div className="border-b border-slate-200 bg-legal-navy p-3 text-white lg:hidden">
      <div className="mb-3 flex items-center gap-2 font-bold">
        <Menu className="h-5 w-5 text-legal-gold" />
        LegalOps Hub
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {items.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`h-10 min-w-20 rounded-md px-3 text-[11px] font-bold ${activePage === key ? "bg-legal-gold" : "bg-white/10"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
