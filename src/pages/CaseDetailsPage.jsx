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
import { useRef, useState } from "react";
import Badge from "../components/Badge";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import {
  caseJourneyStages,
  getCaseJourneyState,
  getClosureChecklist,
  getPostHearingRecommendations,
  getStageStatus,
} from "../utils/caseJourney";
import { getEmployeeName, today } from "../utils/formatters";
import { buildTimeline } from "../utils/timeline";

function Panel({ title, icon: Icon, children, className = "", panelRef }) {
  return (
    <section ref={panelRef} className={`surface scroll-mt-5 p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-legal-gold" />
        <h2 className="text-lg font-bold text-legal-navy">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const stageTargetMap = {
  intake: "documents",
  analysis: "risks",
  preparation: "hearings",
  followup: "postHearing",
  judgment: "documents",
  closure: "closure",
};

function Timeline({ currentStage, onStageSelect }) {
  return (
    <div className="grid gap-3 xl:grid-cols-6">
      {caseJourneyStages.map((stage, index) => {
        const status = getStageStatus(stage.id, currentStage);
        const isDone = status === "مكتملة";
        const isCurrent = status === "حالية";
        return (
          <button
            key={stage.id}
            className={`min-h-40 rounded-lg border p-4 text-right transition hover:-translate-y-0.5 hover:border-legal-gold hover:shadow-panel ${
              isCurrent ? "border-legal-gold bg-legal-softGold" : isDone ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
            }`}
            onClick={() => onStageSelect(stage.id)}
            type="button"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-legal-navy">{index + 1}</span>
              <Badge value={status} />
            </div>
            <h3 className="mt-3 font-bold text-legal-navy">{stage.title}</h3>
            <p className="mt-2 text-xs leading-6 text-slate-600">{stage.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function CaseDetailsPage({ data, caseId, onAddDocument, onAddHearing, onAddTask, onBack, onUpdateCase, onUpdateHearing }) {
  const legalCase = data.cases.find((item) => item.id === caseId);
  const [postHearing, setPostHearing] = useState({ hearingId: "", result: "طلب مذكرة", notes: "", dueDate: "2026-07-08" });
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    name: "",
    type: "تقرير",
    version: "v1",
    status: "معتمد",
    uploadedAt: today,
  });
  const sectionRefs = {
    postHearing: useRef(null),
    closure: useRef(null),
    parties: useRef(null),
    risks: useRef(null),
    hearings: useRef(null),
    tasks: useRef(null),
    documents: useRef(null),
    timeline: useRef(null),
    updates: useRef(null),
  };

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
  const isCaseClosed = ["مغلقة", "مغلقة ومؤرشفة", "مكتمل"].includes(legalCase.status);
  const canClose = closureChecklist.every((item) => item.done) && !isCaseClosed;
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
    if (!canClose) return;
    onUpdateCase(caseId, {
      status: "مغلقة ومؤرشفة",
      lastUpdate: today,
      updates: ["تم إغلاق القضية وأرشفتها بعد اكتمال قائمة التحقق"],
    });
  }

  function submitDocument(event) {
    event.preventDefault();
    onAddDocument({
      ...documentForm,
      caseId,
    });
    setIsAddingDocument(false);
    setDocumentForm((current) => ({ ...current, name: "", version: "v1", uploadedAt: today }));
  }

  function scrollToSection(sectionKey) {
    sectionRefs[sectionKey]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function navigateStage(stageId) {
    scrollToSection(stageTargetMap[stageId] ?? "timeline");
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
        <p className="mb-4 text-sm text-slate-500">اضغط على أي مرحلة للانتقال إلى الجزء المرتبط بها داخل ملف القضية.</p>
        <Timeline currentStage={currentStage} onStageSelect={navigateStage} />
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <button className="btn-secondary h-10" onClick={() => scrollToSection("hearings")}>
            <CalendarDays className="h-4 w-4" />
            الجلسات
          </button>
          <button className="btn-secondary h-10" onClick={() => scrollToSection("tasks")}>
            <ClipboardList className="h-4 w-4" />
            المهام
          </button>
          <button className="btn-secondary h-10" onClick={() => scrollToSection("documents")}>
            <FileText className="h-4 w-4" />
            المستندات
          </button>
          <button className="btn-primary h-10" onClick={() => setIsAddingDocument(true)}>
            <Plus className="h-4 w-4" />
            إضافة مستند
          </button>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="إجراء ما بعد الجلسة" icon={ClipboardCheck} panelRef={sectionRefs.postHearing}>
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

        <Panel title="إغلاق القضية" icon={Flag} panelRef={sectionRefs.closure}>
          <div className="space-y-3">
            {closureChecklist.map((item) => (
              <div key={item.id} className={`flex items-center justify-between rounded-lg border p-3 ${item.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <span className="text-sm font-bold text-legal-navy">{item.label}</span>
                {item.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canClose} onClick={closeCase}>
            {isCaseClosed ? "القضية مغلقة ومؤرشفة" : "إغلاق القضية وأرشفتها"}
          </button>
          {!canClose && <p className="mt-3 text-xs leading-6 text-slate-500">لا يمكن إغلاق القضية حتى تكتمل قائمة التحقق. يمكن للمدير تجاوز ذلك لاحقًا عند إضافة صلاحيات متقدمة.</p>}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="الأطراف" icon={Users} panelRef={sectionRefs.parties}>
          <ul className="space-y-2 text-sm">
            {(legalCase.parties ?? []).map((party) => <li key={party} className="rounded-md bg-slate-50 p-3">{party}</li>)}
          </ul>
        </Panel>
        <Panel title="المخاطر" icon={AlertTriangle} panelRef={sectionRefs.risks}>
          <ul className="space-y-2 text-sm">
            {(legalCase.risks ?? []).map((risk) => <li key={risk} className="rounded-md bg-red-50 p-3 text-red-700">{risk}</li>)}
          </ul>
        </Panel>
        <Panel title="الجلسات" icon={CalendarDays} panelRef={sectionRefs.hearings}>
          <div className="space-y-2">
            {hearings.map((item) => <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">{item.date} - {item.time} | <Badge value={item.preparation} /></div>)}
          </div>
        </Panel>
        <Panel title="المهام المرتبطة" icon={ClipboardList} panelRef={sectionRefs.tasks}>
          <div className="space-y-2">
            {tasks.map((item) => <div key={item.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm"><span>{item.title}</span><Badge value={item.status} /></div>)}
          </div>
        </Panel>
        <Panel title="المستندات" icon={FileText} panelRef={sectionRefs.documents}>
          <button className="btn-secondary mb-3 h-10 w-full" onClick={() => setIsAddingDocument(true)}>
            <Plus className="h-4 w-4" />
            إضافة مستند للقضية
          </button>
          <div className="space-y-2">
            {documents.map((item) => <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">{item.name} - {item.version} - {item.status}</div>)}
            {!documents.length && <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">لا توجد مستندات مرتبطة بهذه القضية.</p>}
          </div>
        </Panel>
        <Panel title="التسلسل الزمني" icon={CalendarDays} panelRef={sectionRefs.timeline}>
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
        <Panel title="سجل التحديثات" icon={ClipboardList} panelRef={sectionRefs.updates}>
          <ul className="space-y-2 text-sm">
            {(legalCase.updates ?? []).map((update) => <li key={update} className="rounded-md bg-slate-50 p-3">{update}</li>)}
          </ul>
        </Panel>
      </div>

      {isAddingDocument && (
        <Modal title="إضافة مستند للقضية" onClose={() => setIsAddingDocument(false)}>
          <form onSubmit={submitDocument} className="grid gap-4 md:grid-cols-2">
            <FormField label="اسم المستند">
              <input className="input" required value={documentForm.name} onChange={(event) => setDocumentForm({ ...documentForm, name: event.target.value })} />
            </FormField>
            <FormField label="النوع">
              <select className="input" value={documentForm.type} onChange={(event) => setDocumentForm({ ...documentForm, type: event.target.value })}>
                <option>مذكرة</option>
                <option>إثبات</option>
                <option>تقرير</option>
                <option>صك حكم</option>
              </select>
            </FormField>
            <FormField label="الإصدار">
              <input className="input" required value={documentForm.version} onChange={(event) => setDocumentForm({ ...documentForm, version: event.target.value })} />
            </FormField>
            <FormField label="الحالة">
              <select className="input" value={documentForm.status} onChange={(event) => setDocumentForm({ ...documentForm, status: event.target.value })}>
                <option>معتمد</option>
                <option>قيد المراجعة</option>
                <option>ناقص</option>
              </select>
            </FormField>
            <FormField label="تاريخ الرفع">
              <input className="input" type="date" required value={documentForm.uploadedAt} onChange={(event) => setDocumentForm({ ...documentForm, uploadedAt: event.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAddingDocument(false)}>إلغاء</button>
              <button className="btn-primary">حفظ المستند</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
