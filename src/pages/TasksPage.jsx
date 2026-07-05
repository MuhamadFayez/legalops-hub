import { Plus } from "lucide-react";
import { useState } from "react";
import Badge from "../components/Badge";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import { getCaseName, getEmployeeName, isOverdue } from "../utils/formatters";

const columns = ["جديد", "قيد العمل", "بانتظار مراجعة", "مكتمل", "متأخر"];

export default function TasksPage({ data, onAddTask, onChangeTaskStatus, canCreate, canUpdateTasks }) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: "", caseId: data.cases[0]?.id ?? "", assigneeId: data.employees[0]?.id ?? "", dueDate: "2026-07-08", priority: "متوسطة", status: "جديد" });

  function submit(event) {
    event.preventDefault();
    onAddTask(form);
    setIsAdding(false);
    setForm({ ...form, title: "" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-legal-navy">لوحة المهام</h2>
        <button className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canCreate} title={!canCreate ? "الدور الحالي لا يملك صلاحية الإضافة" : ""} onClick={() => setIsAdding(true)}><Plus className="h-5 w-5" />إضافة مهمة</button>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((status) => (
          <section key={status} className="surface min-h-[520px] p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-legal-navy">{status}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                {data.tasks.filter((task) => task.status === status).length}
              </span>
            </div>
            <div className="space-y-3">
              {data.tasks.filter((task) => task.status === status).map((task) => (
                <article key={task.id} className={`rounded-lg border bg-white p-4 shadow-sm ${isOverdue(task) ? "border-red-300 bg-red-50" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-legal-navy">{task.title}</h4>
                    <Badge value={task.priority} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{getCaseName(data.cases, task.caseId)}</p>
                  <p className="mt-2 text-xs text-slate-500">المسؤول: {getEmployeeName(data.employees, task.assigneeId)}</p>
                  <p className={`mt-2 text-xs font-bold ${isOverdue(task) ? "text-red-700" : "text-slate-500"}`}>الاستحقاق: {task.dueDate}</p>
                  <select className="input mt-3 h-10 text-xs disabled:cursor-not-allowed disabled:bg-slate-100" disabled={!canUpdateTasks} value={task.status} onChange={(event) => onChangeTaskStatus(task.id, event.target.value)}>
                    {columns.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {isAdding && (
        <Modal title="إضافة مهمة" onClose={() => setIsAdding(false)}>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <FormField label="عنوان المهمة"><input className="input" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></FormField>
            <FormField label="القضية المرتبطة">
              <select className="input" value={form.caseId} onChange={(event) => setForm({ ...form, caseId: event.target.value })}>
                {data.cases.map((item) => <option key={item.id} value={item.id}>{item.number} - {item.clientName}</option>)}
              </select>
            </FormField>
            <FormField label="المسؤول">
              <select className="input" value={form.assigneeId} onChange={(event) => setForm({ ...form, assigneeId: event.target.value })}>
                {data.employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="تاريخ الاستحقاق"><input className="input" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></FormField>
            <FormField label="الأولوية">
              <select className="input" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option>منخفضة</option>
                <option>متوسطة</option>
                <option>عالية</option>
              </select>
            </FormField>
            <FormField label="الحالة">
              <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {columns.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>إلغاء</button>
              <button className="btn-primary">حفظ المهمة</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
