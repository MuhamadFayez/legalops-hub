export const permissionGroups = [
  {
    title: "القضايا",
    permissions: [
      ["view_all_cases", "عرض كل القضايا"],
      ["view_assigned_cases", "عرض القضايا المسندة"],
      ["create_case", "إنشاء قضية"],
      ["edit_case", "تعديل قضية"],
      ["close_case", "إغلاق قضية"],
      ["delete_case", "حذف قضية"],
    ],
  },
  {
    title: "المهام والجلسات",
    permissions: [
      ["create_task", "إنشاء مهمة"],
      ["update_task_status", "تغيير حالة مهمة"],
      ["delete_task", "حذف مهمة"],
      ["create_hearing", "إنشاء جلسة"],
      ["record_hearing_result", "تسجيل نتيجة جلسة"],
    ],
  },
  {
    title: "المستندات والتنبيهات",
    permissions: [
      ["upload_document", "رفع مستند"],
      ["delete_document", "حذف مستند"],
      ["approve_document", "اعتماد مستند"],
      ["send_notification", "إرسال تنبيه"],
      ["share_external", "مشاركة خارجية"],
    ],
  },
  {
    title: "الإدارة",
    permissions: [
      ["view_reports", "عرض التقارير"],
      ["manage_sla", "إدارة SLA"],
      ["manage_permissions", "إدارة الصلاحيات"],
      ["manage_storage", "إدارة التخزين"],
    ],
  },
];

export const permissionLabels = permissionGroups.flatMap((group) => group.permissions);

export const defaultRolePermissions = {
  "مدير المكتب": [
    "view_all_cases",
    "view_assigned_cases",
    "create_case",
    "edit_case",
    "close_case",
    "delete_case",
    "create_task",
    "update_task_status",
    "delete_task",
    "create_hearing",
    "record_hearing_result",
    "upload_document",
    "delete_document",
    "approve_document",
    "send_notification",
    "share_external",
    "view_reports",
    "manage_sla",
    "manage_permissions",
    "manage_storage",
  ],
  "محامي رئيسي": [
    "view_all_cases",
    "view_assigned_cases",
    "create_case",
    "edit_case",
    "close_case",
    "create_task",
    "update_task_status",
    "delete_task",
    "create_hearing",
    "record_hearing_result",
    "upload_document",
    "delete_document",
    "approve_document",
    "send_notification",
    "view_reports",
  ],
  "محامي مساعد": ["view_assigned_cases", "edit_case", "create_task", "update_task_status", "record_hearing_result", "upload_document", "send_notification"],
  "باحث قانوني": ["view_assigned_cases", "edit_case", "create_task", "update_task_status", "upload_document"],
  "سكرتير قانوني": ["view_assigned_cases", "create_case", "create_task", "update_task_status", "create_hearing", "upload_document", "send_notification", "view_reports"],
};

export function normalizeRoleName(role) {
  if (defaultRolePermissions[role]) return role;
  if (String(role).includes("مدير")) return "مدير المكتب";
  if (String(role).includes("رئيس")) return "محامي رئيسي";
  if (String(role).includes("مساعد")) return "محامي مساعد";
  if (String(role).includes("باحث")) return "باحث قانوني";
  if (String(role).includes("سكرت")) return "سكرتير قانوني";
  return role;
}

export function buildPermissionMatrix(roles) {
  return roles.reduce((acc, role) => {
    const normalized = normalizeRoleName(role);
    acc[role] = defaultRolePermissions[normalized] ?? [];
    return acc;
  }, {});
}

export function canRole(permissionMatrix, role, permission) {
  return Boolean(permissionMatrix?.[role]?.includes(permission));
}
