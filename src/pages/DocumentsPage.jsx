import { useMemo, useState } from "react";
import { Download, ExternalLink, FileText, Plus } from "lucide-react";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import { documentTemplates } from "../data/documentTemplates";
import { getCaseName, matchesSearch, today } from "../utils/formatters";

export default function DocumentsPage({ data, canCreate, onAddDocument }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("case-documents");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    caseId: data.cases[0]?.id ?? "",
    type: "مذكرة",
    version: "v1",
    status: "معتمد",
    uploadedAt: today,
  });
  const rows = useMemo(() => data.documents.map((item) => ({ ...item, caseName: getCaseName(data.cases, item.caseId) })).filter((item) => matchesSearch(item, search)), [data, search]);
  const columns = [
    { key: "name", label: "اسم المستند" },
    { key: "caseName", label: "القضية المرتبطة" },
    { key: "type", label: "النوع" },
    { key: "version", label: "الإصدار" },
    { key: "status", label: "الحالة", render: (row) => <Badge value={row.status} /> },
    { key: "uploadedAt", label: "تاريخ الرفع" },
  ];

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          className={`h-10 rounded-md px-4 text-sm font-bold ${activeTab === "case-documents" ? "bg-legal-navy text-white" : "text-slate-600"}`}
          onClick={() => setActiveTab("case-documents")}
        >
          مستندات القضايا
        </button>
        <button
          className={`h-10 rounded-md px-4 text-sm font-bold ${activeTab === "templates" ? "bg-legal-navy text-white" : "text-slate-600"}`}
          onClick={() => setActiveTab("templates")}
        >
          نماذج المكتب
        </button>
      </div>

      {activeTab === "case-documents" ? (
        <DataTable
          title="المستندات"
          columns={columns}
          rows={rows}
          search={search}
          onSearch={setSearch}
          action={
            <button className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canCreate} onClick={() => setIsAdding(true)}>
              <Plus className="h-5 w-5" />
              إضافة مستند
            </button>
          }
        />
      ) : (
        <section className="surface p-5">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-legal-gold" />
            <h2 className="text-lg font-bold text-legal-navy">نماذج المكتب المعتمدة</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documentTemplates.map((template) => {
              const href = `${import.meta.env.BASE_URL}templates/${template.fileName}`;
              return (
                <article key={template.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-legal-gold">{template.category}</p>
                      <h3 className="mt-1 text-base font-bold text-legal-navy">{template.title}</h3>
                    </div>
                    <Badge value="معتمد" />
                  </div>
                  <p className="mt-3 min-h-16 text-sm leading-7 text-slate-600">{template.description}</p>
                  <div className="mt-4 grid gap-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                    <span>المرحلة: <b>{template.stage}</b></span>
                    <span>الدور المسؤول: <b>{template.ownerRole}</b></span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a className="btn-primary h-10 flex-1" href={href} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      فتح
                    </a>
                    <a className="btn-secondary h-10 flex-1" href={href} download>
                      <Download className="h-4 w-4" />
                      تحميل
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {isAdding && (
        <Modal title="إضافة مستند" onClose={() => setIsAdding(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onAddDocument(form);
              setIsAdding(false);
              setForm((current) => ({ ...current, name: "", version: "v1", uploadedAt: today }));
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <FormField label="اسم المستند">
              <input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </FormField>
            <FormField label="القضية المرتبطة">
              <select className="input" value={form.caseId} onChange={(event) => setForm({ ...form, caseId: event.target.value })}>
                {data.cases.map((item) => <option key={item.id} value={item.id}>{item.number} - {item.clientName}</option>)}
              </select>
            </FormField>
            <FormField label="النوع">
              <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option>مذكرة</option>
                <option>عقد</option>
                <option>إثبات</option>
                <option>تقرير</option>
                <option>صك حكم</option>
              </select>
            </FormField>
            <FormField label="الإصدار">
              <input className="input" required value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} />
            </FormField>
            <FormField label="الحالة">
              <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option>معتمد</option>
                <option>قيد المراجعة</option>
                <option>ناقص</option>
                <option>بانتظار تحديث</option>
              </select>
            </FormField>
            <FormField label="تاريخ الرفع">
              <input className="input" type="date" required value={form.uploadedAt} onChange={(event) => setForm({ ...form, uploadedAt: event.target.value })} />
            </FormField>
            <div className="flex justify-end gap-2 md:col-span-2">
              <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>إلغاء</button>
              <button className="btn-primary">حفظ المستند</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
