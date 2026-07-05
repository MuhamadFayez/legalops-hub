import { Search } from "lucide-react";

export default function DataTable({ title, columns, rows, search, onSearch, action }) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-lg font-bold text-legal-navy">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-72">
            <Search className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <input className="input pr-10" placeholder="بحث..." value={search} onChange={(event) => onSearch(event.target.value)} />
          </label>
          {action}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-right">
          <thead className="table-head">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                  لا توجد نتائج مطابقة.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
