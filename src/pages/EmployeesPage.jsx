import { useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { matchesSearch } from "../utils/formatters";

export default function EmployeesPage({ data }) {
  const [search, setSearch] = useState("");
  const rows = useMemo(() => data.employees.filter((item) => matchesSearch(item, search)), [data.employees, search]);
  const columns = [
    { key: "name", label: "اسم الموظف" },
    { key: "role", label: "الدور", render: (row) => <Badge value={row.role} /> },
    { key: "cases", label: "عدد القضايا" },
    { key: "openTasks", label: "عدد المهام المفتوحة" },
    { key: "overdueTasks", label: "المهام المتأخرة", render: (row) => <span className={row.overdueTasks > 0 ? "font-bold text-red-700" : ""}>{row.overdueTasks}</span> },
    { key: "weeklyHearings", label: "جلسات الأسبوع" },
  ];
  return <DataTable title="الموظفون" columns={columns} rows={rows} search={search} onSearch={setSearch} />;
}
