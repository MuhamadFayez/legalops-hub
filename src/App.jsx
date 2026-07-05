import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import Sidebar from "./components/Sidebar";
import { roles } from "./data/seedData";
import CalendarPage from "./pages/CalendarPage";
import CaseDetailsPage from "./pages/CaseDetailsPage";
import CasesPage from "./pages/CasesPage";
import ClientsPage from "./pages/ClientsPage";
import Dashboard from "./pages/Dashboard";
import DocumentsPage from "./pages/DocumentsPage";
import EmployeesPage from "./pages/EmployeesPage";
import HearingsPage from "./pages/HearingsPage";
import GovernancePage from "./pages/GovernancePage";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import TasksPage from "./pages/TasksPage";
import { today } from "./utils/formatters";
import { loadLegalOpsData, saveLegalOpsData } from "./utils/storage";

const pageMeta = {
  dashboard: ["لوحة التحكم", "مؤشرات تشغيلية لحالة المكتب اليومية."],
  cases: ["القضايا", "إدارة القضايا ومتابعة درجات الخطورة والتحديثات."],
  calendar: ["التقويم", "تقويم موحد للجلسات والمهام واستحقاقات القضايا مع ربط Google Calendar."],
  governance: ["الحوكمة", "إدارة الصلاحيات وسياسات SLA والتصعيد قبل ربط التخزين السحابي."],
  caseDetails: ["تفاصيل القضية", "ملف موحد للجلسات والمهام والمستندات والمخاطر."],
  hearings: ["الجلسات", "جدولة الجلسات وربطها بالقضايا والمحامين."],
  tasks: ["المهام", "لوحة كانبان لتوزيع العمل ومراقبة المتأخرات."],
  notifications: ["التنبيهات", "رسائل واتساب ديناميكية للمحامين المسؤولين عن القضايا."],
  employees: ["الموظفون", "نظرة على الأدوار والأحمال التشغيلية."],
  clients: ["العملاء", "متابعة بيانات العملاء وحالة التواصل."],
  documents: ["المستندات", "أرشفة أولية للمستندات والإصدارات والنماذج."],
  reports: ["التقارير", "مؤشرات مختصرة قابلة للتوسيع لاحقًا."],
};

export default function App() {
  const [data, setData] = useState(loadLegalOpsData);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [activeRole, setActiveRole] = useState(roles[0]);

  useEffect(() => {
    saveLegalOpsData(data);
  }, [data]);

  const currentPage = selectedCaseId ? "caseDetails" : activePage;
  const [title, subtitle] = pageMeta[currentPage] ?? pageMeta.dashboard;

  const permissions = useMemo(() => {
    // طبقة صلاحيات أولية قابلة للاستبدال لاحقًا بسياسات من الخادم.
    const managerRoles = ["مدير المكتب", "محامي رئيسي"];
    return {
      canCreate: managerRoles.includes(activeRole),
      canUpdateTasks: activeRole !== "سكرتير قانوني",
    };
  }, [activeRole]);

  function navigate(page) {
    setSelectedCaseId(null);
    setActivePage(page);
  }

  function addCase(form) {
    if (!form.ownerId) return;
    const newCase = {
      ...form,
      id: `case-${Date.now()}`,
      number: `1447-NEW-${String(data.cases.length + 1).padStart(3, "0")}`,
      lastUpdate: today,
      parties: [form.clientName],
      risks: form.risk === "عالية" ? ["قضية جديدة تحتاج مراجعة عاجلة"] : ["لا توجد مخاطر جوهرية مسجلة"],
      updates: ["تم إنشاء القضية من النظام الداخلي"],
    };
    setData((current) => ({ ...current, cases: [newCase, ...current.cases] }));
  }

  function addTask(form) {
    if (!form.caseId) return;
    const newTask = { ...form, id: `task-${Date.now()}` };
    setData((current) => ({ ...current, tasks: [newTask, ...current.tasks] }));
  }

  function addHearing(form) {
    if (!form.caseId) return;
    const newHearing = { ...form, id: `hear-${Date.now()}` };
    setData((current) => ({ ...current, hearings: [newHearing, ...current.hearings] }));
  }

  function updateHearing(hearingId, changes) {
    setData((current) => ({
      ...current,
      hearings: current.hearings.map((hearing) => (hearing.id === hearingId ? { ...hearing, ...changes } : hearing)),
    }));
  }

  function changeTaskStatus(taskId, status) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    }));
  }

  function updateCase(caseId, changes) {
    setData((current) => ({
      ...current,
      cases: current.cases.map((legalCase) =>
        legalCase.id === caseId
          ? {
              ...legalCase,
              ...changes,
              updates: [...(legalCase.updates ?? []), ...(changes.updates ?? [])],
            }
          : legalCase
      ),
    }));
  }

  function createNotification(notification) {
    setData((current) => ({
      ...current,
      notifications: [notification, ...(current.notifications ?? [])],
    }));
  }

  function markNotificationSent(notificationId) {
    setData((current) => ({
      ...current,
      notifications: (current.notifications ?? []).map((notification) =>
        notification.id === notificationId ? { ...notification, status: "تم الإرسال", sentAt: new Date().toISOString() } : notification
      ),
    }));
  }

  function deleteNotification(notificationId) {
    setData((current) => ({
      ...current,
      notifications: (current.notifications ?? []).filter((notification) => notification.id !== notificationId),
    }));
  }

  function renderPage() {
    if (selectedCaseId) {
      return (
        <CaseDetailsPage
          data={data}
          caseId={selectedCaseId}
          onAddHearing={addHearing}
          onAddTask={addTask}
          onBack={() => setSelectedCaseId(null)}
          onUpdateHearing={updateHearing}
          onUpdateCase={updateCase}
        />
      );
    }

    switch (activePage) {
      case "cases":
        return <CasesPage data={data} canCreate={permissions.canCreate} onAddCase={addCase} onOpenCase={setSelectedCaseId} />;
      case "calendar":
        return <CalendarPage data={data} onOpenCase={setSelectedCaseId} />;
      case "governance":
        return <GovernancePage data={data} roles={roles} />;
      case "hearings":
        return <HearingsPage data={data} canCreate={permissions.canCreate} onAddHearing={addHearing} />;
      case "tasks":
        return <TasksPage data={data} canCreate={permissions.canCreate} canUpdateTasks={permissions.canUpdateTasks} onAddTask={addTask} onChangeTaskStatus={changeTaskStatus} />;
      case "notifications":
        return <NotificationsPage data={data} onCreateNotification={createNotification} onDeleteNotification={deleteNotification} onMarkSent={markNotificationSent} />;
      case "employees":
        return <EmployeesPage data={data} />;
      case "clients":
        return <ClientsPage data={data} />;
      case "documents":
        return <DocumentsPage data={data} />;
      case "reports":
        return <ReportsPage data={data} />;
      default:
        return <Dashboard data={data} />;
    }
  }

  return (
    <div className="min-h-screen bg-legal-mist">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <div className="lg:mr-72">
        <MobileNav activePage={activePage} onNavigate={navigate} />
        <Header title={title} subtitle={subtitle} activeRole={activeRole} onRoleChange={setActiveRole} roles={roles} />
        <main className="p-4 md:p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
