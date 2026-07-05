import { badgeClass } from "../utils/statusStyles";

export default function Badge({ value }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${badgeClass(value)}`}>
      {value}
    </span>
  );
}
