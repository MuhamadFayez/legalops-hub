export const notificationTemplates = [
  {
    id: "high_risk_case",
    title: "تنبيه قضية عالية الخطورة",
    eventType: "قضية عالية الخطورة",
    priority: "عاجل",
    body:
      "تنبيه قضية عالية الخطورة\n\nالأستاذ/ {{lawyerName}}\nتم تحديث القضية رقم {{caseNumber}}\nالعميل: {{clientName}}\nالمحكمة: {{court}}\nدرجة الخطورة: {{risk}}\nالإجراء المطلوب: مراجعة الملف وتحديث خطة التعامل.",
  },
  {
    id: "hearing_reminder",
    title: "تذكير جلسة",
    eventType: "جلسة قادمة",
    priority: "مهم",
    body:
      "تذكير جلسة\n\nالأستاذ/ {{lawyerName}}\nلديك جلسة بتاريخ {{hearingDate}} الساعة {{hearingTime}}\nالقضية: {{caseNumber}} - {{clientName}}\nالمحكمة: {{court}}\nحالة التحضير: {{preparation}}\nيرجى مراجعة ملف الجلسة قبل الموعد.",
  },
  {
    id: "overdue_task",
    title: "تنبيه مهمة متأخرة",
    eventType: "مهمة متأخرة",
    priority: "عاجل",
    body:
      "تنبيه مهمة متأخرة\n\nالأستاذ/ {{lawyerName}}\nالمهمة التالية متأخرة:\n{{taskTitle}}\nالقضية: {{caseNumber}} - {{clientName}}\nتاريخ الاستحقاق: {{dueDate}}\nالأولوية: {{priority}}\nيرجى تحديث الحالة أو إتمام الإجراء المطلوب.",
  },
  {
    id: "new_task",
    title: "إسناد مهمة جديدة",
    eventType: "مهمة جديدة",
    priority: "متابعة",
    body:
      "إسناد مهمة جديدة\n\nالأستاذ/ {{lawyerName}}\nتم إسناد مهمة لك:\n{{taskTitle}}\nالقضية: {{caseNumber}} - {{clientName}}\nتاريخ الاستحقاق: {{dueDate}}\nالأولوية: {{priority}}\nيرجى الاطلاع وبدء الإجراء.",
  },
  {
    id: "weekly_summary",
    title: "ملخص أسبوعي للمحامي",
    eventType: "تقرير أسبوعي",
    priority: "إداري",
    body:
      "ملخص أسبوعي\n\nالأستاذ/ {{lawyerName}}\nعدد القضايا المسندة: {{employeeCases}}\nالمهام المفتوحة: {{openTasks}}\nالمهام المتأخرة: {{overdueTasks}}\nجلسات الأسبوع: {{weeklyHearings}}\nيرجى مراجعة لوحة المهام وتحديث الحالات قبل نهاية الأسبوع.",
  },
];
