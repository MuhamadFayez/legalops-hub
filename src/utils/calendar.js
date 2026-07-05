import { byId, getEmployeeName } from "./formatters";

const calendarEventTypes = {
  hearing: {
    label: "جلسة",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  task: {
    label: "مهمة",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  caseUpdate: {
    label: "قضية",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

function formatGoogleDate(date, time = "09:00", durationMinutes = 60) {
  const [hours, minutes] = time.split(":").map(Number);
  const start = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const format = (value) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${format(start)}/${format(end)}`;
}

export function getCalendarEvents(data) {
  const hearingEvents = data.hearings.map((hearing) => {
    const legalCase = byId(data.cases, hearing.caseId);
    return {
      id: `hearing-${hearing.id}`,
      sourceId: hearing.id,
      type: "hearing",
      date: hearing.date,
      time: hearing.time,
      title: `جلسة: ${legalCase?.number ?? "قضية"} - ${legalCase?.clientName ?? ""}`,
      caseId: hearing.caseId,
      caseNumber: legalCase?.number,
      clientName: legalCase?.clientName,
      ownerName: getEmployeeName(data.employees, hearing.lawyerId),
      location: hearing.court,
      description: `حالة التحضير: ${hearing.preparation}\nنتيجة الجلسة: ${hearing.result}`,
      durationMinutes: 90,
    };
  });

  const taskEvents = data.tasks.map((task) => {
    const legalCase = byId(data.cases, task.caseId);
    return {
      id: `task-${task.id}`,
      sourceId: task.id,
      type: "task",
      date: task.dueDate,
      time: "09:00",
      title: `استحقاق مهمة: ${task.title}`,
      caseId: task.caseId,
      caseNumber: legalCase?.number,
      clientName: legalCase?.clientName,
      ownerName: getEmployeeName(data.employees, task.assigneeId),
      location: legalCase?.court,
      description: `القضية: ${legalCase?.number ?? ""} - ${legalCase?.clientName ?? ""}\nالأولوية: ${task.priority}\nالحالة: ${task.status}`,
      durationMinutes: 30,
    };
  });

  const caseEvents = data.cases.map((legalCase) => ({
    id: `case-${legalCase.id}`,
    sourceId: legalCase.id,
    type: "caseUpdate",
    date: legalCase.lastUpdate,
    time: "08:00",
    title: `متابعة قضية: ${legalCase.number} - ${legalCase.clientName}`,
    caseId: legalCase.id,
    caseNumber: legalCase.number,
    clientName: legalCase.clientName,
    ownerName: getEmployeeName(data.employees, legalCase.ownerId),
    location: legalCase.court,
    description: `نوع القضية: ${legalCase.type}\nالحالة: ${legalCase.status}\nدرجة الخطورة: ${legalCase.risk}`,
    durationMinutes: 30,
  }));

  return [...hearingEvents, ...taskEvents, ...caseEvents].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function getEventTypeMeta(type) {
  return calendarEventTypes[type] ?? calendarEventTypes.caseUpdate;
}

export function getGoogleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: formatGoogleDate(event.date, event.time, event.durationMinutes),
    details: event.description,
    location: event.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getMonthDays(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startOffset = firstDay.getDay();
  const days = [];

  for (let index = startOffset; index > 0; index -= 1) {
    const day = new Date(year, monthIndex, 1 - index);
    days.push({ date: day, inMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ date: new Date(year, monthIndex, day), inMonth: true });
  }

  while (days.length % 7 !== 0) {
    const day = new Date(year, monthIndex, days.length - startOffset + 1);
    days.push({ date: day, inMonth: false });
  }

  return days;
}

export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}
