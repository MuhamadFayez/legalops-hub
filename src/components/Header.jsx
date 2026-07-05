import { ShieldCheck } from "lucide-react";

export default function Header({ title, subtitle, activeRole, onRoleChange, roles }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-bold text-legal-gold">LegalOps Hub</p>
        <h1 className="mt-1 text-2xl font-bold text-legal-navy">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 lg:w-72">
        <ShieldCheck className="h-5 w-5 text-legal-gold" />
        <span className="text-xs font-bold text-slate-500">الدور الحالي</span>
        <select className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" value={activeRole} onChange={(event) => onRoleChange(event.target.value)}>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
    </header>
  );
}
