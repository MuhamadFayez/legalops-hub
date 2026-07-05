import { Check, Clock3, MessageSquareText, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import { getCaseName, getEmployeeName, matchesSearch, today } from "../utils/formatters";

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-legal-navy">{value}</p>
        </div>
        <span className="rounded-lg bg-legal-softGold p-3 text-legal-gold">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function BookingsPage({ data, canApprove, onAddBooking, onApproveBooking, onRejectBooking }) {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    caseId: data.cases[0]?.id ?? "",
    type: "اجتماع",
    title: "",
    date: "2026-07-10",
    time: "11:00",
    location: "غرفة الاجتماعات الرئيسية",
    requesterId: data.employees[0]?.id ?? "",
    lawyerId: data.employees[0]?.id ?? "",
    notes: "",
  });

  const rows = useMemo(() => {
    return (data.bookings ?? [])
      .map((item) => ({
        ...item,
        caseName: getCaseName(data.cases, item.caseId),
        requester: getEmployeeName(data.employees, item.requesterId),
        lawyer: getEmployeeName(data.employees, item.lawyerId),
        linkStatus: item.hearingId ? "مرتبط بالجلسات" : "غير مرتبط",
      }))
      .filter((item) => matchesSearch(item, search));
  }, [data, search]);

  const pending = rows.filter((item) => item.status === "بانتظار الموافقة").length;
  const approved = rows.filter((item) => item.status === "معتمد").length;
  const linked = rows.filter((item) => item.hearingId).length;

  const columns = [
    { key: "type", label: "النوع", render: (row) => <Badge value={row.type} /> },
    { key: "title", label: "العنوان" },
    { key: "caseName", label: "القضية" },
    { key: "date", label: "التاريخ" },
    { key: "time", label: "الوقت" },
    { key: "lawyer", label: "المحامي" },
    { key: "status", label: "الحالة", render: (row) => <Badge value={row.status} /> },
    { key: "linkStatus", label: "الربط", render: (row) => <Badge value={row.linkStatus} /> },
    {
      key: "actions",
      label: "الإجراء",
      render: (row) =>
        row.status === "بانتظار الموافقة" ? (
          <div className="flex justify-center gap-2">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 disabled:opacity-40" disabled={!canApprove} title={!canApprove ? "الاعتماد متاح لمدير المكتب أو المحامي الرئيسي" : "اعتماد"} onClick={() => onApproveBooking(row.id)}>
              <Check className="h-4 w-4" />
            </button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-700 disabled:opacity-40" disabled={!canApprove} title={!canApprove ? "الرفض متاح لمدير المكتب أو المحامي الرئيسي" : "رفض"} onClick={() => onRejectBooking(row.id)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">تمت المعالجة</span>
        ),
    },
  ];

  function submit(event) {
    event.preventDefault();
    onAddBooking({ ...form, status: "بانتظار الموافقة", createdAt: today });
    setIsAdding(false);
    setForm((current) => ({ ...current, title: "", notes: "" }));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="بانتظار الموافقة" value={pending} icon={Clock3} />
        <SummaryCard label="حجوزات معتمدة" value={approved} icon={Check} />
        <SummaryCard label="مرتبطة بجدول الجلسات" value={linked} icon={MessageSquareText} />
      </div>

      <DataTable
        title="طلبات الحجز"
        columns={columns}
        rows={rows}
        search={search}
        onSearch={setSearch}
        action={<button className="btn-primary" onClick={() => setIsAdding(true)}><Plus className="h-5 w-5" />طلب حجز</button>}
      />

      {isAdding && (
        <Modal title="طلب حجز اجتماع / مناقشة" onClose={() => setIsAdding(false)}>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <FormField label="القضية">
              <select className="input" value={form.caseId} onChange={(event) => setForm({ ...form, caseId: event.target.value })}>
                {data.cases.map((item) => <option key={item.id} value={item.id}>{item.number} - {item.clientName}</option>)}
              </select>
            </FormField>
            <FormField label="النوع">
              <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option>اجتماع</option>
                <option>مناقشة</option>
              </select>
            </FormField>
            <FormField label="العنوان"><input className="input" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></FormField>
            <FormField label="المكان"><input className="input" required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></FormField>
            <FormField label="التاريخ"><input className="input" type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></FormField>
            <FormField label="الوقت"><input className="input" type="time" required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></FormField>
            <FormField label="مقدم الطلب">
              <select className="input" value={form.requesterId} onChange={(event) => setForm({ ...form, requesterId: event.target.value })}>
                {data.employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="المحامي المسؤول">
              <select className="input" value={form.lawyerId} onChange={(event) => setForm({ ...form, lawyerId: event.target.value })}>
                {data.employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="ملاحظات" className="md:col-span-2">
              <textarea className="min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-legal-gold focus:ring-2 focus:ring-legal-gold/20" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>إلغاء</button>
              <button className="btn-primary">إرسال الطلب</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
