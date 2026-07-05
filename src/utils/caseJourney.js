export const caseJourneyStages = [
  {
    id: "intake",
    title: "استلام القضية",
    description: "فتح ملف القضية، تحديد المسؤول، وجمع المستندات الأساسية.",
  },
  {
    id: "analysis",
    title: "تحليل القضية",
    description: "تحليل الوقائع والأدلة ونقاط القوة والضعف وتحديد المخاطر.",
  },
  {
    id: "preparation",
    title: "تجهيز الجلسات",
    description: "إنشاء الجلسات وربط مهام التحضير والمذكرات والمستندات.",
  },
  {
    id: "followup",
    title: "المتابعة بعد الجلسة",
    description: "تقرير الجلسة، المهام الناتجة، والتواصل مع العميل والفريق.",
  },
  {
    id: "judgment",
    title: "الحكم أو القرار",
    description: "تسجيل الحكم، تحليل الصك، وتحديد الاستئناف أو التنفيذ.",
  },
  {
    id: "closure",
    title: "الإغلاق والأرشفة",
    description: "تقرير ختامي، اكتمال المهام والمستندات، ثم أرشفة الملف.",
  },
];

const completedStatuses = ["مكتمل", "مغلقة", "مغلقة ومؤرشفة", "Ù…ÙƒØªÙ…Ù„"];

export function getCaseJourneyState({ legalCase, hearings, tasks, documents }) {
  const hasAnalysis = legalCase.updates?.some((item) => item.includes("تحليل") || item.includes("خطة") || item.includes("ØªØ­Ù„ÙŠÙ„"));
  const hasHearings = hearings.length > 0;
  const hasPostHearing = hearings.some((item) => item.result && item.result !== "لم تعقد بعد" && item.result !== "Ù„Ù… ØªØ¹Ù‚Ø¯ Ø¨Ø¹Ø¯");
  const hasJudgment = documents.some((item) => item.name?.includes("حكم") || item.name?.includes("صك") || item.name?.includes("Ø­ÙƒÙ…"));
  const isClosed = completedStatuses.includes(legalCase.status);

  if (isClosed) return "closure";
  if (hasJudgment) return "judgment";
  if (hasPostHearing) return "followup";
  if (hasHearings) return "preparation";
  if (hasAnalysis) return "analysis";
  if (tasks.length || documents.length) return "analysis";
  return "intake";
}

export function getStageStatus(stageId, currentStageId) {
  const currentIndex = caseJourneyStages.findIndex((stage) => stage.id === currentStageId);
  const stageIndex = caseJourneyStages.findIndex((stage) => stage.id === stageId);
  if (stageIndex < currentIndex) return "مكتملة";
  if (stageIndex === currentIndex) return "حالية";
  return "قادمة";
}

export function getPostHearingRecommendations(result) {
  const map = {
    "تأجيل": ["إضافة جلسة قادمة", "إنشاء مهمة متابعة سبب التأجيل", "إرسال ملخص للعميل"],
    "طلب مذكرة": ["إنشاء مهمة إعداد مذكرة", "تحديد تاريخ استحقاق", "تنبيه المحامي المسؤول"],
    "طلب مستندات": ["إنشاء مهمة طلب مستندات من العميل", "تنبيه السكرتير القانوني", "تحديث المخاطر"],
    "حجز للحكم": ["إنشاء مهمة متابعة صدور الحكم", "إشعار العميل بانتظار الحكم"],
    "صدر حكم": ["رفع صك الحكم", "إنشاء مهمة تحليل الحكم", "تحديد قرار الاعتراض أو التنفيذ"],
    "تم الصلح": ["إعداد محضر صلح", "إغلاق المهام المفتوحة", "تجهيز تقرير ختامي"],
    "شطبت الدعوى": ["تحليل سبب الشطب", "إنشاء مهمة إجراء تصحيحي", "إشعار المدير"],
  };

  return map[result] ?? ["تحديث سجل القضية", "إنشاء مهمة متابعة", "إرسال ملخص داخلي"];
}

export function getClosureChecklist({ hearings, tasks, documents }) {
  const openTasks = tasks.filter((task) => !completedStatuses.includes(task.status));
  return [
    { id: "hearings", label: "كل الجلسات لها نتيجة مسجلة", done: hearings.length > 0 && hearings.every((item) => item.result && item.result !== "لم تعقد بعد" && item.result !== "Ù„Ù… ØªØ¹Ù‚Ø¯ Ø¨Ø¹Ø¯") },
    { id: "tasks", label: "لا توجد مهام مفتوحة", done: openTasks.length === 0 },
    { id: "documents", label: "المستندات الأساسية مرفوعة", done: documents.length >= 2 },
    { id: "finalReport", label: "التقرير الختامي جاهز", done: documents.some((item) => item.name?.includes("ختامي") || item.name?.includes("نهائي")) },
  ];
}
