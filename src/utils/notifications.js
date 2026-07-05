import { notificationTemplates } from "../data/notificationTemplates";
import { byId, getEmployeeName, isOverdue, today } from "./formatters";

const employeePhones = {
  "emp-1": "966501111111",
  "emp-2": "966502222222",
  "emp-3": "966503333333",
  "emp-4": "966504444444",
  "emp-5": "966505555555",
};

export function normalizePhone(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return digits;
}

export function getEmployeePhone(employee) {
  return normalizePhone(employee?.phone ?? employeePhones[employee?.id] ?? "");
}

export function getWhatsAppUrl(phone, message) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function renderTemplate(templateBody, values) {
  return templateBody.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "غير محدد");
}

export function buildTemplateValues(data, { employeeId, caseId, taskId, hearingId }) {
  const employee = byId(data.employees, employeeId);
  const legalCase = byId(data.cases, caseId);
  const task = byId(data.tasks, taskId);
  const hearing = byId(data.hearings, hearingId);

  return {
    lawyerName: employee?.name ?? getEmployeeName(data.employees, employeeId),
    caseNumber: legalCase?.number,
    clientName: legalCase?.clientName,
    court: hearing?.court ?? legalCase?.court,
    risk: legalCase?.risk,
    taskTitle: task?.title,
    dueDate: task?.dueDate,
    priority: task?.priority,
    hearingDate: hearing?.date,
    hearingTime: hearing?.time,
    preparation: hearing?.preparation,
    employeeCases: employee?.cases,
    openTasks: employee?.openTasks,
    overdueTasks: employee?.overdueTasks,
    weeklyHearings: employee?.weeklyHearings,
    today,
  };
}

export function createNotificationDraft(data, options) {
  const template = notificationTemplates.find((item) => item.id === options.templateId) ?? notificationTemplates[0];
  const values = buildTemplateValues(data, options);
  const employee = byId(data.employees, options.employeeId);
  const message = renderTemplate(template.body, values);

  return {
    id: `notif-${Date.now()}`,
    templateId: template.id,
    title: template.title,
    eventType: template.eventType,
    priority: template.priority,
    channel: "whatsapp",
    recipientEmployeeId: options.employeeId,
    recipientName: employee?.name ?? "غير محدد",
    recipientPhone: getEmployeePhone(employee),
    caseId: options.caseId,
    taskId: options.taskId,
    hearingId: options.hearingId,
    message,
    status: "مسودة",
    createdAt: new Date().toISOString(),
    scheduledAt: options.scheduledAt ?? "",
  };
}

export function getSuggestedNotifications(data) {
  const highRisk = data.cases
    .filter((item) => item.risk === "عالية")
    .map((legalCase) => ({
      id: `suggest-risk-${legalCase.id}`,
      label: `قضية عالية الخطورة - ${legalCase.number}`,
      templateId: "high_risk_case",
      caseId: legalCase.id,
      employeeId: legalCase.ownerId,
    }));

  const overdue = data.tasks
    .filter(isOverdue)
    .map((task) => ({
      id: `suggest-task-${task.id}`,
      label: `مهمة متأخرة - ${task.title}`,
      templateId: "overdue_task",
      taskId: task.id,
      caseId: task.caseId,
      employeeId: task.assigneeId,
    }));

  const hearings = data.hearings
    .filter((hearing) => hearing.date >= today)
    .map((hearing) => ({
      id: `suggest-hearing-${hearing.id}`,
      label: `جلسة قادمة - ${hearing.date} ${hearing.time}`,
      templateId: "hearing_reminder",
      hearingId: hearing.id,
      caseId: hearing.caseId,
      employeeId: hearing.lawyerId,
    }));

  return [...highRisk, ...overdue, ...hearings];
}
