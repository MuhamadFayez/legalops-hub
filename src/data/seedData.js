export const roles = [
  "مدير المكتب",
  "محامي رئيسي",
  "محامي مساعد",
  "باحث قانوني",
  "سكرتير قانوني",
];

export const employees = [
  { id: "emp-1", name: "أحمد السالم", role: "مدير المكتب", cases: 4, openTasks: 7, overdueTasks: 1, weeklyHearings: 3 },
  { id: "emp-2", name: "نورة الحربي", role: "محامي رئيسي", cases: 8, openTasks: 9, overdueTasks: 2, weeklyHearings: 5 },
  { id: "emp-3", name: "خالد العتيبي", role: "محامي مساعد", cases: 5, openTasks: 6, overdueTasks: 0, weeklyHearings: 2 },
  { id: "emp-4", name: "ريم القحطاني", role: "باحث قانوني", cases: 3, openTasks: 8, overdueTasks: 1, weeklyHearings: 1 },
  { id: "emp-5", name: "سارة الدوسري", role: "سكرتير قانوني", cases: 2, openTasks: 4, overdueTasks: 0, weeklyHearings: 6 },
];

export const cases = [
  {
    id: "case-1",
    number: "1446-CR-018",
    clientName: "شركة مدار التقنية",
    type: "تجاري",
    court: "المحكمة التجارية بالرياض",
    ownerId: "emp-2",
    status: "نشطة",
    risk: "عالية",
    lastUpdate: "2026-07-03",
    parties: ["شركة مدار التقنية", "مؤسسة المورد الذكي"],
    risks: ["نزاع تعاقدي عالي القيمة", "موعد مذكرة قريب"],
    updates: ["تم استلام رد الخصم", "تم تكليف الباحث بإعداد سوابق قضائية"],
  },
  {
    id: "case-2",
    number: "1446-LB-044",
    clientName: "عبدالله الزهراني",
    type: "عمالي",
    court: "المحكمة العمالية بجدة",
    ownerId: "emp-3",
    status: "قيد المراجعة",
    risk: "متوسطة",
    lastUpdate: "2026-07-02",
    parties: ["عبدالله الزهراني", "شركة أفق التشغيل"],
    risks: ["مستندات راتب ناقصة"],
    updates: ["تم رفع لائحة الدعوى", "بانتظار تحديد موعد الجلسة"],
  },
  {
    id: "case-3",
    number: "1446-CV-091",
    clientName: "مؤسسة روافد",
    type: "مدني",
    court: "المحكمة العامة بالدمام",
    ownerId: "emp-1",
    status: "نشطة",
    risk: "منخفضة",
    lastUpdate: "2026-06-30",
    parties: ["مؤسسة روافد", "مقاول فرعي"],
    risks: ["تأخر تقرير الخبير"],
    updates: ["تمت مخاطبة الخبير", "تم تحديث ملف المستندات"],
  },
  {
    id: "case-4",
    number: "1446-FM-029",
    clientName: "منى الشمري",
    type: "أحوال شخصية",
    court: "محكمة الأحوال الشخصية بالرياض",
    ownerId: "emp-2",
    status: "نشطة",
    risk: "عالية",
    lastUpdate: "2026-07-01",
    parties: ["منى الشمري", "طرف مدعى عليه"],
    risks: ["حساسية عالية للخصوصية", "طلب مستعجل قائم"],
    updates: ["تم تجهيز مذكرة الرد", "تمت مراجعة الأدلة"],
  },
];

export const hearings = [
  { id: "hear-1", caseId: "case-1", date: "2026-07-04", time: "10:30", court: "المحكمة التجارية بالرياض", lawyerId: "emp-2", preparation: "جاهز", result: "لم تعقد بعد", hearingType: "جلسة" },
  { id: "hear-2", caseId: "case-4", date: "2026-07-04", time: "13:00", court: "محكمة الأحوال الشخصية بالرياض", lawyerId: "emp-2", preparation: "بحاجة مراجعة", result: "لم تعقد بعد", hearingType: "جلسة" },
  { id: "hear-3", caseId: "case-2", date: "2026-07-07", time: "09:15", court: "المحكمة العمالية بجدة", lawyerId: "emp-3", preparation: "قيد التحضير", result: "لم تعقد بعد", hearingType: "جلسة" },
  { id: "hear-4", caseId: "case-3", date: "2026-07-09", time: "11:00", court: "المحكمة العامة بالدمام", lawyerId: "emp-1", preparation: "جاهز", result: "بانتظار تقرير الخبير", hearingType: "جلسة" },
  { id: "hear-booking-2", caseId: "case-4", date: "2026-07-06", time: "16:00", court: "عن بعد", lawyerId: "emp-2", preparation: "قيد التحضير", result: "تثبيت المستندات المطلوبة قبل الجلسة.", hearingType: "اجتماع", bookingId: "booking-2" },
];

export const tasks = [
  { id: "task-1", title: "إعداد مذكرة الرد", caseId: "case-1", assigneeId: "emp-4", dueDate: "2026-07-03", priority: "عالية", status: "متأخر" },
  { id: "task-2", title: "مراجعة عقد التوريد", caseId: "case-1", assigneeId: "emp-2", dueDate: "2026-07-05", priority: "عالية", status: "قيد العمل" },
  { id: "task-3", title: "تجهيز ملف الجلسة", caseId: "case-4", assigneeId: "emp-5", dueDate: "2026-07-04", priority: "متوسطة", status: "بانتظار مراجعة" },
  { id: "task-4", title: "جمع مسيرات الرواتب", caseId: "case-2", assigneeId: "emp-3", dueDate: "2026-07-06", priority: "متوسطة", status: "جديد" },
  { id: "task-5", title: "متابعة تقرير الخبير", caseId: "case-3", assigneeId: "emp-1", dueDate: "2026-07-02", priority: "منخفضة", status: "متأخر" },
  { id: "task-6", title: "أرشفة مستندات القضية", caseId: "case-3", assigneeId: "emp-5", dueDate: "2026-07-01", priority: "منخفضة", status: "مكتمل" },
];

export const clients = [
  { id: "client-1", name: "شركة مدار التقنية", phone: "0501234567", cases: 2, status: "نشط", lastContact: "2026-07-03" },
  { id: "client-2", name: "عبدالله الزهراني", phone: "0558877665", cases: 1, status: "نشط", lastContact: "2026-07-02" },
  { id: "client-3", name: "مؤسسة روافد", phone: "0542233445", cases: 1, status: "متابعة", lastContact: "2026-06-30" },
  { id: "client-4", name: "منى الشمري", phone: "0537788991", cases: 1, status: "حساس", lastContact: "2026-07-01" },
];

export const documents = [
  { id: "doc-1", name: "لائحة الدعوى", caseId: "case-1", type: "مذكرة", version: "v2", status: "معتمد", uploadedAt: "2026-07-01" },
  { id: "doc-2", name: "عقد التوريد", caseId: "case-1", type: "عقد", version: "v1", status: "قيد المراجعة", uploadedAt: "2026-06-29" },
  { id: "doc-3", name: "مسيرات الرواتب", caseId: "case-2", type: "إثبات", version: "v1", status: "ناقص", uploadedAt: "2026-07-02" },
  { id: "doc-4", name: "تقرير الخبير", caseId: "case-3", type: "تقرير", version: "v3", status: "بانتظار تحديث", uploadedAt: "2026-06-28" },
  { id: "doc-5", name: "مذكرة الرد", caseId: "case-4", type: "مذكرة", version: "v1", status: "معتمد", uploadedAt: "2026-07-03" },
];

export const bookings = [
  {
    id: "booking-1",
    caseId: "case-1",
    type: "مناقشة",
    title: "مناقشة استراتيجية الرد",
    date: "2026-07-08",
    time: "12:00",
    location: "غرفة الاجتماعات الرئيسية",
    requesterId: "emp-4",
    lawyerId: "emp-2",
    status: "بانتظار الموافقة",
    notes: "مراجعة نقاط القوة والمخاطر قبل تسليم المذكرة.",
    createdAt: "2026-07-05",
  },
  {
    id: "booking-2",
    caseId: "case-4",
    type: "اجتماع",
    title: "اجتماع تحضيري مع العميل",
    date: "2026-07-06",
    time: "16:00",
    location: "عن بعد",
    requesterId: "emp-5",
    lawyerId: "emp-2",
    status: "معتمد",
    notes: "تثبيت المستندات المطلوبة قبل الجلسة.",
    createdAt: "2026-07-04",
    hearingId: "hear-booking-2",
  },
];

export const initialData = {
  employees,
  cases,
  hearings,
  tasks,
  clients,
  documents,
  bookings,
};
