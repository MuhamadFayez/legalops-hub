import { AlertTriangle, Check, Clock3, RefreshCw, Save, ShieldCheck, SlidersHorizontal, UsersRound, X } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import Badge from "../components/Badge";
import { permissionGroups, buildPermissionMatrix } from "../utils/permissions";
import { buildSlaReport, defaultSlaPolicies, loadSlaPolicies, saveSlaPolicies } from "../utils/sla";

const PERMISSIONS_KEY = "legalops-permission-matrix";

function loadPermissions(roles) {
  try {
    const stored = JSON.parse(localStorage.getItem(PERMISSIONS_KEY));
    return stored && typeof stored === "object" ? stored : buildPermissionMatrix(roles);
  } catch {
    return buildPermissionMatrix(roles);
  }
}

function savePermissions(matrix) {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(matrix));
}

function StatCard({ label, value, icon: Icon, tone = "navy" }) {
  const toneClass = tone === "danger" ? "bg-red-50 text-red-700" : tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-legal-navy";
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-legal-navy">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function GovernancePage({ data, roles }) {
  const [activeTab, setActiveTab] = useState("sla");
  const [permissionMatrix, setPermissionMatrix] = useState(() => loadPermissions(roles));
  const [slaPolicies, setSlaPolicies] = useState(loadSlaPolicies);
  const report = useMemo(() => buildSlaReport(data, slaPolicies), [data, slaPolicies]);

  function togglePermission(role, permission) {
    const current = permissionMatrix[role] ?? [];
    const next = current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission];
    const nextMatrix = { ...permissionMatrix, [role]: next };
    setPermissionMatrix(nextMatrix);
    savePermissions(nextMatrix);
  }

  function updatePolicy(policyId, key, value) {
    const nextPolicies = slaPolicies.map((policy) => (policy.id === policyId ? { ...policy, [key]: Number(value) } : policy));
    setSlaPolicies(nextPolicies);
    saveSlaPolicies(nextPolicies);
  }

  function resetGovernance() {
    const nextMatrix = buildPermissionMatrix(roles);
    setPermissionMatrix(nextMatrix);
    savePermissions(nextMatrix);
    setSlaPolicies(defaultSlaPolicies);
    saveSlaPolicies(defaultSlaPolicies);
  }

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-legal-gold" />
            <div>
              <h2 className="text-lg font-bold text-legal-navy">حوكمة الصلاحيات و SLA</h2>
              <p className="mt-1 text-sm text-slate-500">الأساس الذي سنبني عليه صلاحيات Google Drive لاحقًا.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={`btn-secondary ${activeTab === "sla" ? "border-legal-gold text-legal-navy" : ""}`} onClick={() => setActiveTab("sla")}>
              <Clock3 className="h-4 w-4" />
              SLA
            </button>
            <button className={`btn-secondary ${activeTab === "permissions" ? "border-legal-gold text-legal-navy" : ""}`} onClick={() => setActiveTab("permissions")}>
              <ShieldCheck className="h-4 w-4" />
              الصلاحيات
            </button>
            <button className="btn-secondary" onClick={resetGovernance}>
              <RefreshCw className="h-4 w-4" />
              استعادة الافتراضي
            </button>
          </div>
        </div>
      </section>

      {activeTab === "sla" ? (
        <SlaView report={report} policies={slaPolicies} onUpdatePolicy={updatePolicy} />
      ) : (
        <PermissionsView matrix={permissionMatrix} roles={roles} onToggle={togglePermission} />
      )}
    </div>
  );
}

function SlaView({ report, policies, onUpdatePolicy }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="قريبة من التأخير" value={report.totals.warning} icon={Clock3} tone="warning" />
        <StatCard label="متأخرة" value={report.totals.breached} icon={AlertTriangle} tone="danger" />
        <StatCard label="متأخرة ومصعّدة" value={report.totals.escalated} icon={AlertTriangle} tone="danger" />
        <StatCard label="إجمالي المهام" value={report.totals.tasks} icon={SlidersHorizontal} />
      </div>

      <section className="surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-legal-gold" />
          <h2 className="text-lg font-bold text-legal-navy">سياسات SLA</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {policies.map((policy) => (
            <div key={policy.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-legal-navy">{policy.name}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">مدة SLA بالساعات</span>
                  <input className="input" type="number" min="1" value={policy.targetHours} onChange={(event) => onUpdatePolicy(policy.id, "targetHours", event.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">الإنذار عند %</span>
                  <input className="input" type="number" min="1" max="99" value={policy.warningAtPercent} onChange={(event) => onUpdatePolicy(policy.id, "warningAtPercent", event.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-500">التصعيد بعد التأخير</span>
                  <input className="input" type="number" min="1" value={policy.escalateAfterHours} onChange={(event) => onUpdatePolicy(policy.id, "escalateAfterHours", event.target.value)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-lg font-bold text-legal-navy">مهام SLA</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">المهمة</th>
                  <th className="px-4 py-3">القضية</th>
                  <th className="px-4 py-3">المسؤول</th>
                  <th className="px-4 py-3">السياسة</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">التقدم</th>
                </tr>
              </thead>
              <tbody>
                {report.taskRows.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="table-cell font-bold text-legal-navy">{task.title}</td>
                    <td className="table-cell">{task.caseNumber} - {task.clientName}</td>
                    <td className="table-cell">{task.assigneeName}</td>
                    <td className="table-cell">{task.sla.policy.name}</td>
                    <td className="table-cell"><Badge value={task.sla.status} /></td>
                    <td className="table-cell">
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${task.sla.status.includes("متأخر") ? "bg-red-500" : "bg-legal-gold"}`} style={{ width: `${task.sla.progress}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-legal-gold" />
            <h2 className="text-lg font-bold text-legal-navy">التزام الموظفين</h2>
          </div>
          <div className="space-y-4">
            {report.employeePerformance.map((row) => (
              <div key={row.employee.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-legal-navy">{row.employee.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.assigned} مهام | {row.escalated} تصعيد</p>
                  </div>
                  <span className={`text-xl font-bold ${row.compliance < 70 ? "text-red-700" : "text-emerald-700"}`}>{row.compliance}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${row.compliance < 70 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${row.compliance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PermissionsView({ matrix, roles, onToggle }) {
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-lg font-bold text-legal-navy">مصفوفة الصلاحيات</h2>
        <p className="mt-1 text-sm text-slate-500">هذه المصفوفة ستكون المرجع لاحقًا لصلاحيات Google Drive والمستندات.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-right">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3">الصلاحية</th>
              {roles.map((role) => <th key={role} className="px-4 py-3 text-center">{role}</th>)}
            </tr>
          </thead>
          <tbody>
            {permissionGroups.map((group) => (
              <Fragment key={group.title}>
                <tr className="bg-slate-50">
                  <td className="px-4 py-3 text-sm font-bold text-legal-navy" colSpan={roles.length + 1}>{group.title}</td>
                </tr>
                {group.permissions.map(([permission, label]) => (
                  <tr key={permission} className="hover:bg-slate-50">
                    <td className="table-cell font-bold text-legal-navy">{label}</td>
                    {roles.map((role) => {
                      const enabled = matrix[role]?.includes(permission);
                      return (
                        <td key={`${role}-${permission}`} className="table-cell text-center">
                          <button
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                              enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"
                            }`}
                            onClick={() => onToggle(role, permission)}
                            aria-label={`${label} - ${role}`}
                          >
                            {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 p-4 text-sm text-slate-500">
        <Save className="h-4 w-4 text-legal-gold" />
        يتم حفظ التغييرات تلقائيًا في المتصفح.
      </div>
    </section>
  );
}
