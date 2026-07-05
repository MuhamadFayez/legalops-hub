import {
  ArrowRight,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Flag,
  GitBranch,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";
import Badge from "../components/Badge";
import FormField from "../components/FormField";
import {
  caseJourneyStages,
  getCaseJourneyState,
  getClosureChecklist,
  getPostHearingRecommendations,
  getStageStatus,
} from "../utils/caseJourney";
import { getEmployeeName, today } from "../utils/formatters";
import { buildTimeline } from "../utils/timeline";

function Panel({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`surface p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-legal-gold" />
        <h2 className="text-lg font-bold text-legal-navy">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Timeline({ currentStage }) {
  return (
    <div className="grid gap-3 xl:grid-cols-6">
      {caseJourneyStages.map((stage, index) => {
        const status = getStageStatus(stage.id, currentStage);
        const isDone = status === "مكتملة";
        const isCurrent = status === "حالية";
        return (
          <div key={stage.id} className={`rounded-lg border p-4 ${isCurrent ? "border-legal-gold bg-legal-softGold" : isDone ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-legal-navy">{index + 1}</span>
              <Badge value={status} />
            </div>
            <h3 className="mt-3 font-bold text-legal-navy">{stage.title}</h3>
            <p className="mt-2 text-xs leading-6 text-slate-600">{stage.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function CaseDetailsPage({ data, caseId, onAddHearing, onAddTask, onBack, onUpdateCase, onUpdateHearing }) {
  const legalCase = data.cases.find((item) => item.id === caseId);
  const [postHearing, setPostHearing] = useState({ hearingId: "", result: "طلب مذكرة", notes: "", dueDate: "2026-07-08" });

  if (!legalCase) {
    return (
      <div className="surface p-8 text-center">
        <p className="font-bold">لم يتم العثور على القضية.</p>
        <button className="btn-primary mt-4" onClick={onBack}>العودة للقضايا</button>
      </div>
    );
  }

  const hearings = data.hearings.filter((item) => item.caseId === caseId);
  const tasks = data.tasks.filter((item) => item.caseId === caseId);
  const documents = data.documents.filter((item) => item.caseId === caseId);
  const timelineEvents = buildTimeline(data, caseId).slice(0, 8);
  const currentStage = getCaseJourneyState({ legalCase, hearings, tasks, documents });
  const closureChecklist = getClosureChecklist({ hearings, tasks, documents });
  const canClose = closureChecklist.every((item) => item.done);
  const selectedHearing = hearings.find((item) => item.id === postHearing.hearingId) ?? hearings[0];
  const recommendations = getPostHearingRecommendations(postHearing.result);

  function submitPostHearing(event) {
    event.preventDefault();
    const hearing = selectedHearing;
    const taskTitle = `متابعة ما بعد الجلسة: ${postHearing.result}`;

    onAddTask({
      title: taskTitle,
      caseId,
      assigneeId: legalCase.ownerId,
      dueDate: postHearing.dueDate,
      priority: postHearing.result === "صدر حكم" || postHearing.result === "طلب مذكرة" ? "عالية" : "متوسطة",
      status: "جديد",
    });

    if (postHearing.result === "تأجيل") {
      onAddHearing({
        caseId,
        date: postHearing.dueDate,
        time: hearing?.time ?? "10:00",
        court: hearing?.court ?? legalCase.court,
        lawyerId: legalCase.ownerId,
        preparation: "قيد التحضير",
        result: "لم تعقد بعد",
      });
    }

    if (hearing?.id) {
      onUpdateHearing(hearing.id, {
        result: postHearing.result,
        preparation: "مكتمل",
      });
    }

    onUpdateCase(caseId, {
      lastUpdate: today,
      updates: [
        `تم تسجيل نتيجة جلسة: ${postHearing.result}`,
        postHearing.notes ? `ملاحظات ما بعد الجلسة: ${postHearing.notes}` : "تم إنشاء مهمة متابعة ما بعد الجلسة",
      ],
    });

    setPostHearing({ hearingId: "", result: "طلب مذكرة", notes: "", dueDate: "2026-07-08" });
  }

  function closeCase() {
    onUpdateCase(caseId, {
      status: "مغلقة ومؤرشفة",
      lastUpdate: today,
      updates: ["تم إغلاق القضية وأرشفتها بعد اكتمال قائمة التحقق"],
    });
  }

  return (
    <div className="space-y-5">
      <button className="btn-secondary" onClick={onBack}>
        <ArrowRight className="h-4 w-4" />
        العودة للقضايا
      </button>

      <section className={`surface p-6 ${legalCase.risk === "عالية" ? "border-red-300 bg-red-50/40" : ""}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold text-legal-gold">{legalCase.number}</p>
            <h2 className="mt-1 text-2xl font-bold text-legal-navy">{legalCase.clientName}</h2>
            <p className="mt-2 text-sm text-slate-500">{legalCase.type} - {legalCase.court}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge value={legalCase.status} />
            <Badge value={legalCase.risk} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">المسؤول</p>
            <p className="mt-1 font-bold">{getEmployeeName(data.employees, legalCase.ownerId)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">آخر تحديث</p>
            <p className="mt-1 font-bold">{legalCase.lastUpdate}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">المرحلة الحالية</p>
            <p className="mt-1 font-bold">{caseJourneyStages.find((stage) => stage.id === currentStage)?.title}</p>
          </div>
        </div>
      </section>

      <Panel title="رحلة القضية" icon={GitBranch} className="xl:col-span-2">
        <Timeline currentStage={currentStage} />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="إجراء ما بعد الجلسة" icon={ClipboardCheck}>
          <form onSubmit={submitPostHearing} className="space-y-4">
            <FormField label="الجلسة">
              <select className="input" value={postHearing.hearingId} onChange={(event) => setPostHearing({ ...postHearing, hearingId: event.target.value })}>
                {hearings.map((item) => (
                  <option key={item.id} value={item.id}>{item.date} - {item.time} - {item.court}</option>
                ))}
              </select>
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="نتيجة الجلسة">
                <select className="input" value={postHearing.result} onChange={(event) => setPostHearing({ ...postHearing, result: event.target.value })}>
                  <option>تأجيل</option>
                  <option>طلب مذكرة</option>
                  <option>طلب مستندات</option>
                  <option>حجز للحكم</option>
                  <option>صدر حكم</option>
                  <option>تم الصلح</option>
                  <option>شطبت الدعوى</option>
                </select>
              </FormField>
              <FormField label="تاريخ المتابعة">
                <input className="input" type="date" value={postHearing.dueDate} onChange={(event) => setPostHearing({ ...postHearing, dueDate: event.target.value })} />
              </FormField>
            </div>
            <FormField label="ملاحظات المحامي">
              <textarea className="min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-legal-gold focus:ring-2 focus:ring-legal-gold/20" value={postHearing.notes} onChange={(event) => setPostHearing({ ...postHearing, notes: event.target.value })} />
            </FormField>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-sm font-bold text-legal-navy">الإجراءات المقترحة</p>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((item) => <Badge key={item} value={item} />)}
              </div>
            </div>
            <button className="btn-primary w-full" disabled={!hearings.length}>
              <Plus className="h-5 w-5" />
              إنشاء إجراءات ما بعد الجلسة
            </button>
          </form>
        </Panel>

        <Panel title="إغلاق القضية" icon={Flag}>
          <div className="space-y-3">
            {closureChecklist.map((item) => (
              <div key={item.id} className={`flex items-center justify-between rounded-lg border p-3 ${item.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <span className="text-sm font-bold text-legal-navy">{item.label}</span>
                {item.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canClose} onClick={closeCase}>
            إغلاق القضية وأرشفتها
          </button>
          {!canClose && <p className="mt-3 text-xs leading-6 text-slate-500">لا يمكن إغلاق القضية حتى تكتمل قائمة التحقق. يمكن للمدير تجاوز ذلك لاحقًا عند إضافة صلاحيات متقدمة.</p>}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="الأطراف" icon={Users}>
          <ul className="space-y-2 text-sm">
            {(legalCase.parties ?? []).map((party) => <li key={party} className="rounded-md bg-slate-50 p-3">{party}</li>)}
          </ul>
        </Panel>
        <Panel title="المخاطر" icon={AlertTriangle}>
          <ul className="space-y-2 text-sm">
            {(legalCase.risks ?? []).map((risk) => <li key={risk} className="rounded-md bg-red-50 p-3 text-red-700">{risk}</li>)}
          </ul>
        </Panel>
        <Panel title="الجلسات" icon={CalendarDays}>
          <div className="space-y-2">
            {hearings.map((item) => <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">{item.date} - {item.time} | <Badge value={item.preparation} /></div>)}
          </div>
        </Panel>
        <Panel title="المهام المرتبطة" icon={ClipboardList}>
          <div className="space-y-2">
            {tasks.map((item) => <div key={item.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm"><span>{item.title}</span><Badge value={item.status} /></div>)}
          </div>
        </Panel>
        <Panel title="المستندات" icon={FileText}>
          <div className="space-y-2">
            {documents.map((item) => <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">{item.name} - {item.version} - {item.status}</div>)}
          </div>
        </Panel>
        <Panel title="التسلسل الزمني" icon={CalendarDays}>
          <div className="space-y-3">
            {timelineEvents.map((event) => (
              <div key={event.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-legal-navy">{event.title}</span>
                  <Badge value={event.type} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{event.date}{event.time ? ` - ${event.time}` : ""} | {event.owner}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="سجل التحديثات" icon={ClipboardList}>
          <ul className="space-y-2 text-sm">
            {(legalCase.updates ?? []).map((update) => <li key={update} className="rounded-md bg-slate-50 p-3">{update}</li>)}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
