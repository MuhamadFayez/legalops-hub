import { initialData } from "../data/seedData";

const STORAGE_KEY = "legalops-hub-data";

export function loadLegalOpsData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seeded = { ...initialData, notifications: [], bookings: initialData.bookings ?? [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      ...initialData,
      ...parsed,
      notifications: parsed.notifications ?? [],
      bookings: parsed.bookings ?? initialData.bookings ?? [],
      hearings: (parsed.hearings ?? initialData.hearings).map((hearing) => ({ hearingType: "جلسة", ...hearing })),
    };
  } catch {
    const seeded = { ...initialData, notifications: [], bookings: initialData.bookings ?? [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveLegalOpsData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
