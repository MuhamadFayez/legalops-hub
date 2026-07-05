import { getCaseName, getEmployeeName } from "./formatters";

function sortTimeline(a, b) {
  const left = `${a.date} ${a.time ?? "00:00"}`;
  const right = `${b.date} ${b.time ?? "00:00"}`;
  return right.localeCompare(left);
}

export function buildTimeline(data, caseId = "all") {
  const inScope = (item) => caseId === "all" || item.caseId === caseId;
  const events = [];

  data.cases.filter(inScope).forEach((legalCase) => {
    events.push({
      id: `case-${legalCase.id}`,
      date: legalCase.lastUpdate,
      time: "",
      type: "قضية",
      title: `تحديث القضية ${legalCase.number}`,
      description: legalCase.updates?.at(-1) ?? "تم تحديث ملف القضية",
      caseName: getCaseName(data.cases, legalCase.id),
      owner: getEmployeeName(data.employees, legalCase.ownerId),
      status: legalCase.status,
      caseId: legalCase.id,
    });
  });

  data.hearings.filter(inScope).forEach((hearing) => {
    events.push({
      id: `hearing-${hearing.id}`,
      date: hearing.date,
      time: hearing.time,
      type: hearing.hearingType ?? "جلسة",
      title: `${hearing.hearingType ?? "جلسة"} - ${getCaseName(data.cases, hearing.caseId)}`,
      description: hearing.result,
      caseName: getCaseName(data.cases, hearing.caseId),
      owner: getEmployeeName(data.employees, hearing.lawyerId),
      status: hearing.preparation,
      caseId: hearing.caseId,
    });
  });

  data.tasks.filter(inScope).forEach((task) => {
    events.push({
      id: `task-${task.id}`,
      date: task.dueDate,
      time: "",
      type: "مهمة",
      title: task.title,
      description: `الأولوية: ${task.priority}`,
      caseName: getCaseName(data.cases, task.caseId),
      owner: getEmployeeName(data.employees, task.assigneeId),
      status: task.status,
      caseId: task.caseId,
    });
  });

  data.documents.filter(inScope).forEach((document) => {
    events.push({
      id: `document-${document.id}`,
      date: document.uploadedAt,
      time: "",
      type: "مستند",
      title: document.name,
      description: `${document.type} - ${document.version}`,
      caseName: getCaseName(data.cases, document.caseId),
      owner: "الأرشيف",
      status: document.status,
      caseId: document.caseId,
    });
  });

  (data.bookings ?? []).filter(inScope).forEach((booking) => {
    events.push({
      id: `booking-${booking.id}`,
      date: booking.date,
      time: booking.time,
      type: booking.type,
      title: booking.title,
      description: booking.location,
      caseName: getCaseName(data.cases, booking.caseId),
      owner: getEmployeeName(data.employees, booking.lawyerId),
      status: booking.status,
      caseId: booking.caseId,
    });
  });

  return events.sort(sortTimeline);
}
