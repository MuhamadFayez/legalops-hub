import { Plus, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import { getEmployeeName, matchesSearch } from "../utils/formatters";

export default function CasesPage({ data, onAddCase, onOpenCase, canCreate }) {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ clientName: "", type: "تجاري", court: "", ownerId: data.employees[0]?.id ?? "", status: "نشطة", risk: "متوسطة" });

  const rows = useMemo(() => data.cases.filter((item) => matchesSearch(item, search)), [data.cases, search]);

  const columns = [
    { key: "number", label: "رقم القضية" },
    { key: "clientName", label: "اسم العميل" },
    { key: "type", label: "نوع القضية" },
    { key: "court", label: "المحكمة" },
    { key: "ownerId", label: "المحامي المسؤول", render: (row) => getEmployeeName(data.employees, row.ownerId) },
    { key: "status", label: "الحالة", render: (row) => <Badge value={row.status} /> },
    { key: "risk", label: "درجة الخطورة", render: (row) => <Badge value={row.risk} /> },
    { key: "lastUpdate", label: "آخر تحديث" },
    {
      key: "actions",
      label: "تفاصيل",
      render: (row) => (
        <button className="btn-secondary h-9 px-3" onClick={() => onOpenCase(row.id)}>
          <Eye className="h-4 w-4" />
          عرض
        </button>
      ),
    },
  ];

  function submit(event) {
    event.preventDefault();
    onAddCase(form);
    setIsAdding(false);
    setForm({ clientName: "", type: "تجاري", court: "", ownerId: data.employees[0]?.id ?? "", status: "نشطة", risk: "متوسطة" });
  }

  return (
    <>
      <DataTable
        title="جدول القضايا"
        columns={columns}
        rows={rows}
        search={search}
        onSearch={setSearch}
        action={
          <button className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canCreate} title={!canCreate ? "الدور الحالي لا يملك صلاحية الإضافة" : ""} onClick={() => setIsAdding(true)}>
            <Plus className="h-5 w-5" />
            إضافة قضية جديدة
          </button>
        }
      />

      {isAdding && (
        <Modal title="إضافة قضية جديدة" onClose={() => setIsAdding(false)}>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <FormField label="اسم العميل">
              <input className="input" required value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} />
            </FormField>
            <FormField label="نوع القضية">
              <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option>تجاري</option>
                <option>عمالي</option>
                <option>مدني</option>
                <option>أحوال شخصية</option>
                <option>جنائي</option>
              </select>
            </FormField>
            <FormField label="المحكمة">
              <input className="input" required value={form.court} onChange={(event) => setForm({ ...form, court: event.target.value })} />
            </FormField>
            <FormField label="المسؤول">
              <select className="input" value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })}>
                {data.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="الحالة">
              <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option>نشطة</option>
                <option>قيد المراجعة</option>
                <option>مكتمل</option>
              </select>
            </FormField>
            <FormField label="درجة الخطورة">
              <select className="input" value={form.risk} onChange={(event) => setForm({ ...form, risk: event.target.value })}>
                <option>منخفضة</option>
                <option>متوسطة</option>
                <option>عالية</option>
              </select>
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>إلغاء</button>
              <button className="btn-primary">حفظ القضية</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
