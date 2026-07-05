import { CalendarCheck, CalendarClock, CalendarDays, ClipboardList } from "lucide-react";
import { useState } from "react";
import BookingsPage from "./BookingsPage";
import CalendarPage from "./CalendarPage";
import HearingsPage from "./HearingsPage";
import TimelinePage from "./TimelinePage";

const tabs = [
  { key: "calendar", label: "التقويم", icon: CalendarCheck },
  { key: "hearings", label: "الجلسات", icon: CalendarDays },
  { key: "bookings", label: "الحجوزات", icon: ClipboardList },
  { key: "timeline", label: "التسلسل الزمني", icon: CalendarClock },
];

export default function SchedulePage({
  data,
  canCreate,
  canApproveBookings,
  onAddBooking,
  onAddHearing,
  onApproveBooking,
  onOpenCase,
  onRejectBooking,
}) {
  const [activeTab, setActiveTab] = useState("calendar");

  const pendingBookings = (data.bookings ?? []).filter((item) => item.status === "بانتظار الموافقة").length;
  const upcomingHearings = data.hearings.filter((item) => item.result === "لم تعقد بعد").length;

  function renderTab() {
    switch (activeTab) {
      case "hearings":
        return <HearingsPage data={data} canCreate={canCreate} onAddHearing={onAddHearing} />;
      case "bookings":
        return (
          <BookingsPage
            data={data}
            canApprove={canApproveBookings}
            onAddBooking={onAddBooking}
            onApproveBooking={onApproveBooking}
            onRejectBooking={onRejectBooking}
          />
        );
      case "timeline":
        return <TimelinePage data={data} onOpenCase={onOpenCase} />;
      default:
        return <CalendarPage data={data} onOpenCase={onOpenCase} />;
    }
  }

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-legal-navy">الجدولة والمتابعة</h2>
            <p className="mt-1 text-sm text-slate-500">مساحة واحدة للمواعيد الرسمية، طلبات الحجز، وتسلسل أحداث القضايا.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-bold text-slate-500">جلسات قادمة</p>
              <p className="mt-1 text-xl font-bold text-legal-navy">{upcomingHearings}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-bold text-slate-500">حجوزات بانتظار الموافقة</p>
              <p className="mt-1 text-xl font-bold text-legal-navy">{pendingBookings}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`flex h-12 items-center justify-center gap-2 rounded-md border text-sm font-bold transition ${
                  active ? "border-legal-gold bg-legal-softGold text-legal-navy" : "border-slate-200 bg-white text-slate-500 hover:border-legal-gold/60"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {renderTab()}
    </div>
  );
}
