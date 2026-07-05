import { byId, today } from "./formatters";

export const defaultSlaPolicies = [
  { id: "normal_task", name: "مهمة عادية", targetHours: 72, warningAtPercent: 75, escalateAfterHours: 12 },
  { id: "high_priority_task", name: "مهمة عالية الأولوية", targetHours: 24, warningAtPercent: 75, escalateAfterHours: 6 },
  { id: "urgent_task", name: "مهمة عاجلة", targetHours: 4, warningAtPercent: 60, escalateAfterHours: 2 },
  { id: "hearing_report", name: "تقرير جلسة", targetHours: 2, warningAtPercent: 70, escalateAfterHours: 2 },
  { id: "case_analysis", name: "تحليل قضية جديدة", targetHours: 48, warningAtPercent: 75, escalateAfterHours: 12 },
  { id: "high_risk_case", name: "قضية عالية الخطورة", targetHours: 4, warningAtPercent: 60, escalateAfterHours: 4 },
];

const SLA_SETTINGS_KEY = "legalops-sla-policies";
const COMPLETED_STATUSES = ["مكتمل", "مغلقة", "مغلقة ومؤرشفة", "Ù…ÙƒØªÙ…Ù„"];
const HIGH_PRIORITY = ["عالية", "Ø¹Ø§Ù„ÙŠØ©"];

export function loadSlaPolicies() {
  try {
    const stored = JSON.parse(localStorage.getItem(SLA_SETTINGS_KEY));
    return Array.isArray(stored) && stored.length ? stored : defaultSlaPolicies;
  } catch {
    return defaultSlaPolicies;
  }
}

export function saveSlaPolicies(policies) {
  localStorage.setItem(SLA_SETTINGS_KEY, JSON.stringify(policies));
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function getNow() {
  return new Date(`${today}T12:00:00`);
}

function inferCreatedAt(dueDate, targetHours) {
  const due = new Date(`${dueDate}T17:00:00`);
  return addHours(due, -targetHours);
}

function getTaskPolicy(task, policies) {
  if (HIGH_PRIORITY.includes(task.priority)) return policies.find((policy) => policy.id === "high_priority_task") ?? policies[0];
  return policies.find((policy) => policy.id === "normal_task") ?? policies[0];
}

export function calculateTaskSla(task, policies) {
  const policy = getTaskPolicy(task, policies);
  const now = getNow();
  const createdAt = task.createdAt ? new Date(task.createdAt) : inferCreatedAt(task.dueDate, policy.targetHours);
  const dueAt = task.dueAt ? new Date(task.dueAt) : addHours(createdAt, policy.targetHours);
  const elapsedHours = Math.max(0, (now - createdAt) / 36e5);
  const overdueHours = Math.max(0, (now - dueAt) / 36e5);
  const progress = Math.min(100, Math.round((elapsedHours / Math.max(1, policy.targetHours)) * 100));
  const completed = COMPLETED_STATUSES.includes(task.status);

  let status = "ضمن الوقت";
  if (completed) status = "مكتمل";
  else if (overdueHours >= policy.escalateAfterHours) status = "متأخر ومصعّد";
  else if (overdueHours > 0) status = "متأخر";
  else if (progress >= policy.warningAtPercent) status = "قريب من الانتهاء";

  return {
    policy,
    createdAt,
    dueAt,
    progress,
    overdueHours: Math.round(overdueHours),
    status,
  };
}

export function calculateCaseSla(legalCase, policies) {
  const policy = HIGH_PRIORITY.includes(legalCase.risk)
    ? policies.find((item) => item.id === "high_risk_case") ?? policies[0]
    : policies.find((item) => item.id === "case_analysis") ?? policies[0];
  const now = getNow();
  const lastActivity = new Date(`${legalCase.lastUpdate}T10:00:00`);
  const dueAt = addHours(lastActivity, policy.targetHours);
  const overdueHours = Math.max(0, (now - dueAt) / 36e5);
  let status = "ضمن الوقت";
  if (overdueHours >= policy.escalateAfterHours) status = "متأخر ومصعّد";
  else if (overdueHours > 0) status = "متأخر";
  return { policy, dueAt, overdueHours: Math.round(overdueHours), status };
}

export function buildSlaReport(data, policies) {
  const taskRows = data.tasks.map((task) => {
    const legalCase = byId(data.cases, task.caseId);
    const employee = byId(data.employees, task.assigneeId);
    return {
      ...task,
      caseNumber: legalCase?.number,
      clientName: legalCase?.clientName,
      assigneeName: employee?.name,
      sla: calculateTaskSla(task, policies),
    };
  });

  const caseRows = data.cases.map((legalCase) => ({
    ...legalCase,
    ownerName: byId(data.employees, legalCase.ownerId)?.name,
    sla: calculateCaseSla(legalCase, policies),
  }));

  const byStatus = ["ضمن الوقت", "قريب من الانتهاء", "متأخر", "متأخر ومصعّد", "مكتمل"].map((status) => ({
    label: status,
    value: taskRows.filter((task) => task.sla.status === status).length,
  }));

  const employeePerformance = data.employees.map((employee) => {
    const assigned = taskRows.filter((task) => task.assigneeId === employee.id);
    const completed = assigned.filter((task) => task.sla.status === "مكتمل").length;
    const breached = assigned.filter((task) => task.sla.status === "متأخر" || task.sla.status === "متأخر ومصعّد").length;
    const escalated = assigned.filter((task) => task.sla.status === "متأخر ومصعّد").length;
    const compliance = assigned.length ? Math.round(((assigned.length - breached) / assigned.length) * 100) : 100;
    return {
      employee,
      assigned: assigned.length,
      completed,
      breached,
      escalated,
      compliance,
    };
  });

  return {
    taskRows,
    caseRows,
    byStatus,
    employeePerformance,
    totals: {
      tasks: taskRows.length,
      warning: taskRows.filter((task) => task.sla.status === "قريب من الانتهاء").length,
      breached: taskRows.filter((task) => task.sla.status === "متأخر").length,
      escalated: taskRows.filter((task) => task.sla.status === "متأخر ومصعّد").length,
    },
  };
}
