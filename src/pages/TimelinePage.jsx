import { CalendarClock, Filter, GitCommitVertical } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import FormField from "../components/FormField";
import { buildTimeline } from "../utils/timeline";

const eventTypes = ["الكل", "قضية", "جلسة", "اجتماع", "مناقشة", "مهمة", "مستند"];

export default function TimelinePage({ data, onOpenCase }) {
  const [caseId, setCaseId] = useState("all");
  const [eventType, setEventType] = useState("الكل");
  const events = useMemo(() => {
    return buildTimeline(data, caseId).filter((event) => eventType === "الكل" || event.type === eventType);
  }, [data, caseId, eventType]);

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-legal-gold" />
            <div>
              <h2 className="text-lg font-bold text-legal-navy">التسلسل الزمني</h2>
              <p className="mt-1 text-sm text-slate-500">عرض موحد لأحداث القضايا والجلسات والمهام والمستندات والحجوزات.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:w-[520px]">
            <FormField label="القضية">
              <select className="input" value={caseId} onChange={(event) => setCaseId(event.target.value)}>
                <option value="all">كل القضايا</option>
                {data.cases.map((item) => (
                  <option key={item.id} value={item.id}>{item.number} - {item.clientName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="نوع الحدث">
              <select className="input" value={eventType} onChange={(event) => setEventType(event.target.value)}>
                {eventTypes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-5 flex items-center gap-2">
          <Filter className="h-5 w-5 text-legal-gold" />
          <h2 className="text-lg font-bold text-legal-navy">{events.length} حدث</h2>
        </div>
        <div className="relative space-y-4 before:absolute before:right-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
          {events.map((event) => (
            <article key={event.id} className="relative pr-11">
              <span className="absolute right-0 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-legal-gold bg-white text-legal-gold">
                <GitCommitVertical className="h-4 w-4" />
              </span>
              <div className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-legal-gold/60">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge value={event.type} />
                      <Badge value={event.status} />
                    </div>
                    <h3 className="mt-3 font-bold text-legal-navy">{event.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{event.description}</p>
                  </div>
                  <div className="text-sm font-bold text-legal-navy xl:text-left">
                    <p>{event.date}{event.time ? ` - ${event.time}` : ""}</p>
                    <p className="mt-1 text-xs text-slate-500">{event.owner}</p>
                  </div>
                </div>
                <button className="mt-3 text-sm font-bold text-legal-gold hover:text-legal-navy" onClick={() => onOpenCase(event.caseId)}>
                  {event.caseName}
                </button>
              </div>
            </article>
          ))}
          {!events.length && <p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">لا توجد أحداث مطابقة.</p>}
        </div>
      </section>
    </div>
  );
}
