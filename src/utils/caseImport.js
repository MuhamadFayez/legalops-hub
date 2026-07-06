import { today } from "./formatters";

const headerAliases = {
  number: ["رقم القضية", "رقم قضيه", "case number", "case_no"],
  hearingDate: ["موعد القضية", "موعد الجلسة", "تاريخ الجلسة", "الجلسة القادمة"],
  plaintiff: ["المدعي", "المدعى", "plaintiff"],
  defendant: ["المدعى عليه", "المدعي عليه", "defendant"],
  powerOfAttorney: ["رقم الوكالة", "الوكالة", "poa"],
  supervisor: ["مشرف القضية", "المشرف", "المحامي المسؤول", "المسؤول"],
  notes: ["ملاحظات", "ملاحضات", "notes"],
  status: ["حالة القضية", "الحالة"],
  type: ["نوع القضية", "النوع"],
  court: ["المحكمة", "المحكمة / الدائرة", "الدائرة"],
  risk: ["درجة الخطورة", "الخطورة"],
  clientName: ["العميل", "اسم العميل"],
};

const defaultValues = {
  status: "قيد المراجعة",
  type: "غير محدد",
  court: "غير محدد",
  risk: "متوسطة",
};

function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeHeader(value) {
  return normalize(value).replace(/\s+/g, " ").toLowerCase();
}

function findHeader(headers, aliases) {
  const normalized = headers.map(normalizeHeader);
  return aliases.reduce((found, alias) => {
    if (found !== -1) return found;
    return normalized.indexOf(normalizeHeader(alias));
  }, -1);
}

function getCell(row, headers, key) {
  const index = findHeader(headers, headerAliases[key] ?? []);
  return index === -1 ? "" : normalize(row[index]);
}

function getEmployeeIdByName(employees, name) {
  const normalizedName = normalize(name);
  if (!normalizedName) return employees[0]?.id ?? "";
  return employees.find((employee) => employee.name === normalizedName)?.id ?? employees[0]?.id ?? "";
}

function buildWarnings(record, employees) {
  const warnings = [];
  if (!record.supervisor) warnings.push("لا يوجد مشرف قضية، تم اختيار أول موظف افتراضيًا.");
  if (record.supervisor && !employees.some((employee) => employee.name === record.supervisor)) {
    warnings.push(`المشرف "${record.supervisor}" غير موجود ضمن الموظفين، تم اختيار أول موظف افتراضيًا.`);
  }
  if (!record.court || record.court === defaultValues.court) warnings.push("لا توجد محكمة محددة.");
  if (!record.type || record.type === defaultValues.type) warnings.push("لا يوجد نوع قضية محدد.");
  return warnings;
}

function buildCase(record, employees, existingCase) {
  const clientName = record.clientName || record.plaintiff || record.defendant || "عميل غير محدد";
  const parties = [record.plaintiff, record.defendant].filter(Boolean);
  const importNote = `تم ${existingCase ? "تحديث" : "استيراد"} القضية من ملف Excel بتاريخ ${today}`;

  return {
    ...(existingCase ?? {}),
    id: existingCase?.id ?? `case-import-${record.number}`,
    number: record.number,
    clientName,
    type: record.type || existingCase?.type || defaultValues.type,
    court: record.court || existingCase?.court || defaultValues.court,
    ownerId: getEmployeeIdByName(employees, record.supervisor) || existingCase?.ownerId,
    status: record.status || existingCase?.status || defaultValues.status,
    risk: record.risk || existingCase?.risk || defaultValues.risk,
    lastUpdate: today,
    parties: parties.length ? parties : existingCase?.parties ?? [clientName],
    risks: existingCase?.risks ?? ["تم استيراد القضية وتحتاج مراجعة أولية."],
    updates: [...(existingCase?.updates ?? []), importNote, record.notes ? `ملاحظة الاستيراد: ${record.notes}` : ""].filter(Boolean),
    importMeta: {
      importedAt: today,
      powerOfAttorney: record.powerOfAttorney,
      source: "Excel",
    },
  };
}

function buildHearing(record, legalCase, employees) {
  if (!record.hearingDate) return null;
  return {
    id: `hear-import-${legalCase.number}-${record.hearingDate}`.replace(/[^\w-]+/g, "-"),
    caseId: legalCase.id,
    date: record.hearingDate,
    time: "",
    court: legalCase.court,
    lawyerId: getEmployeeIdByName(employees, record.supervisor) || legalCase.ownerId,
    preparation: "قيد التحضير",
    result: record.notes || "تم إنشاؤها من موعد القضية في ملف Excel",
    hearingType: "جلسة",
  };
}

export async function parseCasesWorkbook(file, data) {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headers = rows[0] ?? [];
  const numberIndex = findHeader(headers, headerAliases.number);
  const errors = [];

  if (numberIndex === -1) {
    return { sheetName, headers, previewRows: [], errors: ["لا يوجد عمود باسم رقم القضية."], stats: { new: 0, update: 0, total: 0 } };
  }

  const seenNumbers = new Map();
  const existingByNumber = new Map(data.cases.map((item) => [item.number, item]));
  const previewRows = rows.slice(1).map((row, index) => {
    const record = {
      rowNumber: index + 2,
      number: getCell(row, headers, "number"),
      hearingDate: getCell(row, headers, "hearingDate"),
      plaintiff: getCell(row, headers, "plaintiff"),
      defendant: getCell(row, headers, "defendant"),
      powerOfAttorney: getCell(row, headers, "powerOfAttorney"),
      supervisor: getCell(row, headers, "supervisor"),
      notes: getCell(row, headers, "notes"),
      status: getCell(row, headers, "status") || defaultValues.status,
      type: getCell(row, headers, "type") || defaultValues.type,
      court: getCell(row, headers, "court") || defaultValues.court,
      risk: getCell(row, headers, "risk") || defaultValues.risk,
      clientName: getCell(row, headers, "clientName"),
    };

    if (!record.number) errors.push(`الصف ${record.rowNumber}: رقم القضية فارغ.`);
    const previousRow = seenNumbers.get(record.number);
    if (record.number && previousRow) {
      errors.push(`رقم القضية ${record.number} مكرر في الصفين ${previousRow} و ${record.rowNumber}.`);
    }
    if (record.number) seenNumbers.set(record.number, record.rowNumber);

    const existingCase = existingByNumber.get(record.number);
    const legalCase = record.number ? buildCase(record, data.employees, existingCase) : null;
    const hearing = legalCase ? buildHearing(record, legalCase, data.employees) : null;
    const warnings = buildWarnings(record, data.employees);

    return {
      ...record,
      action: existingCase ? "تحديث" : "إضافة",
      warnings,
      case: legalCase,
      hearing,
    };
  }).filter((row) => row.number || row.plaintiff || row.defendant);

  const stats = {
    total: previewRows.length,
    new: previewRows.filter((row) => row.action === "إضافة").length,
    update: previewRows.filter((row) => row.action === "تحديث").length,
  };

  return { sheetName, headers, previewRows, errors, stats };
}
