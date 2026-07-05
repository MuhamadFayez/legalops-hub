import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import { getCaseName, getEmployeeName, matchesSearch } from "../utils/formatters";

export default function HearingsPage({ data, onAddHearing, canCreate }) {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ caseId: data.cases[0]?.id ?? "", date: "2026-07-10", time: "10:00", court: "", lawyerId: data.employees[0]?.id ?? "", preparation: "قيد التحضير", result: "لم تعقد بعد" });

  const enriched = useMemo(() => data.hearings.map((item) => ({ ...item, caseName: getCaseName(data.cases, item.caseId), lawyer: getEmployeeName(data.employees, item.lawyerId) })), [data]);
  const rows = enriched.filter((item) => matchesSearch(item, search));

  const columns = [
    { key: "date", label: "التاريخ" },
    { key: "time", label: "الوقت" },
    { key: "caseName", label: "اسم القضية" },
    { key: "court", label: "المحكمة" },
    { key: "lawyer", label: "المحامي المسؤول" },
    { key: "preparation", label: "حالة التحضير", render: (row) => <Badge value={row.preparation} /> },
    { key: "result", label: "نتيجة الجلسة" },
  ];

  function submit(event) {
    event.preventDefault();
    onAddHearing(form);
    setIsAdding(false);
  }

  return (
    <>
      <DataTable
        title="جدول الجلسات"
        columns={columns}
        rows={rows}
        search={search}
        onSearch={setSearch}
        action={<button className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canCreate} title={!canCreate ? "الدور الحالي لا يملك صلاحية الإضافة" : ""} onClick={() => setIsAdding(true)}><Plus className="h-5 w-5" />إضافة جلسة</button>}
      />
      {isAdding && (
        <Modal title="إضافة جلسة" onClose={() => setIsAdding(false)}>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <FormField label="القضية">
              <select className="input" value={form.caseId} onChange={(event) => setForm({ ...form, caseId: event.target.value })}>
                {data.cases.map((item) => <option key={item.id} value={item.id}>{item.number} - {item.clientName}</option>)}
              </select>
            </FormField>
            <FormField label="المحامي المسؤول">
              <select className="input" value={form.lawyerId} onChange={(event) => setForm({ ...form, lawyerId: event.target.value })}>
                {data.employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="التاريخ"><input className="input" type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></FormField>
            <FormField label="الوقت"><input className="input" type="time" required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></FormField>
            <FormField label="المحكمة"><input className="input" required value={form.court} onChange={(event) => setForm({ ...form, court: event.target.value })} /></FormField>
            <FormField label="حالة التحضير">
              <select className="input" value={form.preparation} onChange={(event) => setForm({ ...form, preparation: event.target.value })}>
                <option>قيد التحضير</option>
                <option>بحاجة مراجعة</option>
                <option>جاهز</option>
              </select>
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>إلغاء</button>
              <button className="btn-primary">حفظ الجلسة</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
