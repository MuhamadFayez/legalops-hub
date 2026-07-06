import { AlertTriangle, CheckCircle2, Database, Download, FileSpreadsheet, Upload } from "lucide-react";
import { useState } from "react";
import Badge from "../components/Badge";
import { parseCasesWorkbook } from "../utils/caseImport";

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-legal-navy">{value}</p>
    </div>
  );
}

export default function CaseImportPage({ data, canCreate, onImportCases }) {
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [imported, setImported] = useState(null);
  const templateHref = `${import.meta.env.BASE_URL}templates/cases-import-template.xlsx`;

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImported(null);
    setIsParsing(true);
    try {
      const parsed = await parseCasesWorkbook(file, data);
      setResult(parsed);
    } catch (error) {
      setResult({
        previewRows: [],
        errors: [`تعذر قراءة الملف: ${error.message}`],
        stats: { total: 0, new: 0, update: 0 },
      });
    } finally {
      setIsParsing(false);
    }
  }

  function approveImport() {
    if (!result || result.errors.length || !result.previewRows.length) return;
    const summary = onImportCases(result.previewRows);
    setImported(summary);
  }

  const hasBlockingErrors = Boolean(result?.errors?.length);

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-legal-gold" />
            <div>
              <h2 className="text-lg font-bold text-legal-navy">استيراد القضايا من Excel</h2>
              <p className="mt-1 text-sm text-slate-500">رقم القضية هو المفتاح. إذا كان الرقم موجودًا سيتم تحديث القضية، وإذا كان جديدًا سيتم إنشاؤها.</p>
            </div>
          </div>
          <a className="btn-secondary" href={templateHref} download>
            <Download className="h-4 w-4" />
            تحميل قالب الاستيراد
          </a>
        </div>
      </section>

      <section className="surface p-5">
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-legal-gold hover:bg-legal-softGold/40">
          <Upload className="h-8 w-8 text-legal-gold" />
          <span className="mt-3 font-bold text-legal-navy">{fileName || "اختر ملف Excel للقضايا"}</span>
          <span className="mt-1 text-sm text-slate-500">يدعم .xlsx و .xls. يجب أن يحتوي الملف على عمود رقم القضية.</span>
          <input className="hidden" type="file" accept=".xlsx,.xls" onChange={handleFile} />
        </label>
      </section>

      {isParsing && <p className="surface p-5 text-sm font-bold text-legal-navy">جاري قراءة الملف...</p>}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="إجمالي الصفوف" value={result.stats.total} />
            <Stat label="قضايا جديدة" value={result.stats.new} />
            <Stat label="تحديث قضايا موجودة" value={result.stats.update} />
          </div>

          {hasBlockingErrors && (
            <section className="surface border-red-200 bg-red-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="font-bold">أخطاء تمنع الاستيراد</h2>
              </div>
              <ul className="space-y-2 text-sm text-red-700">
                {result.errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </section>
          )}

          {imported && (
            <section className="surface border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">تم الاستيراد: {imported.added} إضافة، {imported.updated} تحديث، {imported.hearings} موعد/جلسة.</p>
              </div>
            </section>
          )}

          <section className="surface overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-legal-navy">معاينة قبل الاعتماد</h2>
                <p className="mt-1 text-sm text-slate-500">راجع الصفوف والتحذيرات. لن يتم الحفظ إلا بعد الضغط على اعتماد الاستيراد.</p>
              </div>
              <button className="btn-primary disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canCreate || hasBlockingErrors || !result.previewRows.length} onClick={approveImport}>
                <Database className="h-4 w-4" />
                اعتماد الاستيراد
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">الصف</th>
                    <th className="px-4 py-3">الإجراء</th>
                    <th className="px-4 py-3">رقم القضية</th>
                    <th className="px-4 py-3">المدعي</th>
                    <th className="px-4 py-3">المدعى عليه</th>
                    <th className="px-4 py-3">رقم الوكالة</th>
                    <th className="px-4 py-3">مشرف القضية</th>
                    <th className="px-4 py-3">موعد القضية</th>
                    <th className="px-4 py-3">ملاحظات</th>
                    <th className="px-4 py-3">تحذيرات</th>
                  </tr>
                </thead>
                <tbody>
                  {result.previewRows.map((row) => (
                    <tr key={`${row.rowNumber}-${row.number}`} className="hover:bg-slate-50">
                      <td className="table-cell">{row.rowNumber}</td>
                      <td className="table-cell"><Badge value={row.action} /></td>
                      <td className="table-cell font-bold text-legal-navy">{row.number}</td>
                      <td className="table-cell">{row.plaintiff || "-"}</td>
                      <td className="table-cell">{row.defendant || "-"}</td>
                      <td className="table-cell">{row.powerOfAttorney || "-"}</td>
                      <td className="table-cell">{row.supervisor || "-"}</td>
                      <td className="table-cell">{row.hearingDate || "-"}</td>
                      <td className="table-cell">{row.notes || "-"}</td>
                      <td className="table-cell">
                        {row.warnings.length ? <span className="text-xs text-amber-700">{row.warnings.join(" | ")}</span> : <span className="text-xs text-emerald-700">سليم</span>}
                      </td>
                    </tr>
                  ))}
                  {!result.previewRows.length && (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={10}>لا توجد صفوف قابلة للمعاينة.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
