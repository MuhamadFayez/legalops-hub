import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import { matchesSearch } from "../utils/formatters";

export default function ClientsPage({ data }) {
  const [search, setSearch] = useState("");
  const rows = useMemo(() => data.clients.filter((item) => matchesSearch(item, search)), [data.clients, search]);
  const columns = [
    { key: "name", label: "اسم العميل" },
    { key: "phone", label: "رقم التواصل" },
    { key: "cases", label: "عدد القضايا" },
    { key: "status", label: "الحالة", render: (row) => <Badge value={row.status} /> },
    { key: "lastContact", label: "آخر تواصل" },
  ];
  return <DataTable title="العملاء" columns={columns} rows={rows} search={search} onSearch={setSearch} />;
}
