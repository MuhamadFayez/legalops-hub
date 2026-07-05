import { BellRing, CheckCircle2, ClipboardCopy, ExternalLink, MessageCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import FormField from "../components/FormField";
import { notificationTemplates } from "../data/notificationTemplates";
import { byId, getCaseName } from "../utils/formatters";
import { createNotificationDraft, getSuggestedNotifications, getWhatsAppUrl } from "../utils/notifications";

function getDefaultForm(data) {
  const firstCase = data.cases[0];
  return {
    templateId: "high_risk_case",
    employeeId: firstCase?.ownerId ?? data.employees[0]?.id ?? "",
    caseId: firstCase?.id ?? "",
    taskId: "",
    hearingId: "",
    scheduledAt: "",
  };
}

export default function NotificationsPage({ data, onCreateNotification, onDeleteNotification, onMarkSent }) {
  const [form, setForm] = useState(getDefaultForm(data));
  const [copied, setCopied] = useState(false);

  const suggestions = useMemo(() => getSuggestedNotifications(data), [data]);
  const preview = useMemo(() => createNotificationDraft(data, form), [data, form]);
  const template = notificationTemplates.find((item) => item.id === form.templateId);

  function applySuggestion(suggestion) {
    setForm({
      templateId: suggestion.templateId,
      employeeId: suggestion.employeeId,
      caseId: suggestion.caseId ?? "",
      taskId: suggestion.taskId ?? "",
      hearingId: suggestion.hearingId ?? "",
      scheduledAt: "",
    });
  }

  function submit(event) {
    event.preventDefault();
    onCreateNotification(preview);
  }

  async function copyMessage(message) {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openWhatsApp(notification) {
    window.open(getWhatsAppUrl(notification.recipientPhone, notification.message), "_blank", "noopener,noreferrer");
    onMarkSent(notification.id);
  }

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="mb-5 flex items-center gap-2">
          <BellRing className="h-5 w-5 text-legal-gold" />
          <h2 className="text-lg font-bold text-legal-navy">مركز تنبيهات واتساب</h2>
        </div>
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <FormField label="نوع التنبيه">
              <select className="input" value={form.templateId} onChange={(event) => setForm({ ...form, templateId: event.target.value })}>
                {notificationTemplates.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </FormField>

            <FormField label="المستلم">
              <select className="input" value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}>
                {data.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.name} - {employee.role}</option>
                ))}
              </select>
            </FormField>

            <FormField label="القضية المرتبطة">
              <select className="input" value={form.caseId} onChange={(event) => setForm({ ...form, caseId: event.target.value })}>
                <option value="">بدون قضية</option>
                {data.cases.map((legalCase) => (
                  <option key={legalCase.id} value={legalCase.id}>{legalCase.number} - {legalCase.clientName}</option>
                ))}
              </select>
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="المهمة">
                <select className="input" value={form.taskId} onChange={(event) => setForm({ ...form, taskId: event.target.value, caseId: byId(data.tasks, event.target.value)?.caseId ?? form.caseId })}>
                  <option value="">بدون مهمة</option>
                  {data.tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="الجلسة">
                <select className="input" value={form.hearingId} onChange={(event) => setForm({ ...form, hearingId: event.target.value, caseId: byId(data.hearings, event.target.value)?.caseId ?? form.caseId })}>
                  <option value="">بدون جلسة</option>
                  {data.hearings.map((hearing) => (
                    <option key={hearing.id} value={hearing.id}>{hearing.date} - {getCaseName(data.cases, hearing.caseId)}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="جدولة اختيارية">
              <input className="input" type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} />
            </FormField>

            <button className="btn-primary w-full">
              <Plus className="h-5 w-5" />
              إنشاء تنبيه
            </button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-legal-gold">{template?.eventType}</p>
                <h3 className="mt-1 font-bold text-legal-navy">معاينة الرسالة</h3>
              </div>
              <Badge value={template?.priority ?? "متابعة"} />
            </div>
            <textarea className="min-h-64 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none" value={preview.message} readOnly />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-secondary flex-1" onClick={() => copyMessage(preview.message)}>
                <ClipboardCopy className="h-4 w-4" />
                {copied ? "تم النسخ" : "نسخ الرسالة"}
              </button>
              <button type="button" className="btn-primary flex-1" onClick={() => window.open(getWhatsAppUrl(preview.recipientPhone, preview.message), "_blank", "noopener,noreferrer")}>
                <MessageCircle className="h-4 w-4" />
                فتح واتساب
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-legal-gold" />
          <h2 className="text-lg font-bold text-legal-navy">اقتراحات تلقائية</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((suggestion) => (
            <button key={suggestion.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-right transition hover:border-legal-gold hover:bg-legal-softGold" onClick={() => applySuggestion(suggestion)}>
              <p className="font-bold text-legal-navy">{suggestion.label}</p>
              <p className="mt-2 text-xs text-slate-500">اضغط لاستخدامه في محرر الرسالة.</p>
            </button>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-legal-navy">سجل التنبيهات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">العنوان</th>
                <th className="px-4 py-3">المستلم</th>
                <th className="px-4 py-3">القناة</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">تاريخ الإنشاء</th>
                <th className="px-4 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {(data.notifications ?? []).length ? (
                data.notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-slate-50">
                    <td className="table-cell font-bold text-legal-navy">{notification.title}</td>
                    <td className="table-cell">{notification.recipientName}</td>
                    <td className="table-cell">واتساب</td>
                    <td className="table-cell"><Badge value={notification.status} /></td>
                    <td className="table-cell">{new Date(notification.createdAt).toLocaleString("ar-SA")}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                      <button className="btn-secondary h-9 px-3" onClick={() => openWhatsApp(notification)}>
                        {notification.status === "تم الإرسال" ? <CheckCircle2 className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                        فتح
                      </button>
                      <button className="btn-secondary h-9 px-3 text-red-700 hover:border-red-200 hover:text-red-700" onClick={() => onDeleteNotification(notification.id)}>
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={6}>لم يتم إنشاء تنبيهات بعد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
