import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import { getCalendarEvents, getEventTypeMeta, getGoogleCalendarUrl, getMonthDays, toDateKey } from "../utils/calendar";
import { today } from "../utils/formatters";

const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const eventTypeOptions = [
  ["all", "كل الأحداث"],
  ["hearing", "الجلسات"],
  ["task", "المهام"],
  ["caseUpdate", "القضايا"],
];

export default function CalendarPage({ data, onOpenCase }) {
  const initialDate = new Date(today);
  const [cursor, setCursor] = useState({ year: initialDate.getFullYear(), month: initialDate.getMonth() });
  const [selectedDate, setSelectedDate] = useState(today);
  const [eventType, setEventType] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [query, setQuery] = useState("");

  const allEvents = useMemo(() => getCalendarEvents(data), [data]);
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesType = eventType === "all" || event.type === eventType;
      const matchesCase = caseFilter === "all" || event.caseId === caseFilter;
      const matchesQuery = !query.trim() || `${event.title} ${event.description} ${event.ownerName}`.toLowerCase().includes(query.trim().toLowerCase());
      return matchesType && matchesCase && matchesQuery;
    });
  }, [allEvents, caseFilter, eventType, query]);

  const monthDays = getMonthDays(cursor.year, cursor.month);
  const selectedEvents = filteredEvents.filter((event) => event.date === selectedDate);
  const upcomingEvents = filteredEvents.filter((event) => event.date >= today).slice(0, 8);
  const monthLabel = new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" }).format(new Date(cursor.year, cursor.month, 1));

  function moveMonth(direction) {
    const next = new Date(cursor.year, cursor.month + direction, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-legal-gold" />
            <div>
              <h2 className="text-lg font-bold text-legal-navy">تقويم القضايا</h2>
              <p className="mt-1 text-sm text-slate-500">كل الجلسات والمهام وتحديثات القضايا في مكان واحد.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <label className="relative block md:w-72">
              <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-400" />
              <input className="input pr-10" placeholder="بحث في التقويم..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              <Filter className="h-4 w-4 text-legal-gold" />
              <select className="h-11 bg-transparent text-sm outline-none" value={eventType} onChange={(event) => setEventType(event.target.value)}>
                {eventTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <select className="input md:w-72" value={caseFilter} onChange={(event) => setCaseFilter(event.target.value)}>
              <option value="all">كل القضايا</option>
              {data.cases.map((legalCase) => <option key={legalCase.id} value={legalCase.id}>{legalCase.number} - {legalCase.clientName}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <button className="btn-secondary h-10 px-3" onClick={() => moveMonth(1)} aria-label="الشهر التالي">
              <ChevronRight className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-legal-navy">{monthLabel}</h2>
            <button className="btn-secondary h-10 px-3" onClick={() => moveMonth(-1)} aria-label="الشهر السابق">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {weekDays.map((day) => <div key={day} className="px-2 py-3 text-center text-xs font-bold text-slate-500">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map(({ date, inMonth }) => {
              const dateKey = toDateKey(date);
              const dayEvents = filteredEvents.filter((event) => event.date === dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday = today === dateKey;
              return (
                <button
                  key={dateKey}
                  className={`min-h-32 border-b border-l border-slate-100 p-2 text-right transition hover:bg-legal-softGold/50 ${inMonth ? "bg-white" : "bg-slate-50 text-slate-400"} ${isSelected ? "ring-2 ring-inset ring-legal-gold" : ""}`}
                  onClick={() => setSelectedDate(dateKey)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isToday ? "bg-legal-gold text-white" : "bg-slate-100 text-legal-navy"}`}>
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && <span className="rounded-full bg-legal-navy px-2 py-0.5 text-[10px] font-bold text-white">{dayEvents.length}</span>}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const meta = getEventTypeMeta(event.type);
                      return <div key={event.id} className={`truncate rounded border px-2 py-1 text-[11px] font-bold ${meta.color}`}>{event.title}</div>;
                    })}
                    {dayEvents.length > 3 && <p className="text-[11px] font-bold text-slate-500">+{dayEvents.length - 3} أخرى</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="surface p-5">
            <h2 className="mb-4 text-lg font-bold text-legal-navy">أحداث اليوم المحدد</h2>
            <div className="space-y-3">
              {selectedEvents.length ? selectedEvents.map((event) => <CalendarEventCard key={event.id} event={event} onOpenCase={onOpenCase} />) : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">لا توجد أحداث في هذا اليوم.</p>}
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="mb-4 text-lg font-bold text-legal-navy">الأحداث القادمة</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => <CalendarEventCard key={event.id} compact event={event} onOpenCase={onOpenCase} />)}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CalendarEventCard({ event, onOpenCase, compact = false }) {
  const meta = getEventTypeMeta(event.type);
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${meta.color}`}>{meta.label}</span>
          <h3 className="mt-2 font-bold text-legal-navy">{event.title}</h3>
        </div>
        <p className="whitespace-nowrap text-xs font-bold text-slate-500">{event.date} {event.time}</p>
      </div>
      {!compact && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{event.description}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        {event.ownerName && <span>المسؤول: <b>{event.ownerName}</b></span>}
        {event.location && <span>الموقع: <b>{event.location}</b></span>}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {event.caseId && (
          <button className="btn-secondary h-10 flex-1" onClick={() => onOpenCase(event.caseId)}>
            فتح القضية
          </button>
        )}
        <a className="btn-primary h-10 flex-1" href={getGoogleCalendarUrl(event)} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" />
          Google Calendar
        </a>
      </div>
    </article>
  );
}
