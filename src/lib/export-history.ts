export type ExportHistoryEntry = {
  id: string;
  projectId: string;
  projectName: string;
  fileName: string;
  formatId: string;
  aspectRatio: string;
  exportedAt: string;
};

const EXPORT_HISTORY_KEY = "scatter:export-history";
const MAX_EXPORT_HISTORY = 20;

function readHistory(): ExportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(EXPORT_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExportHistoryEntry[];
  } catch {
    return [];
  }
}

function writeHistory(entries: ExportHistoryEntry[]): void {
  localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_EXPORT_HISTORY)));
}

export function listExportHistory(): ExportHistoryEntry[] {
  return readHistory();
}

export function recordExport(entry: Omit<ExportHistoryEntry, "id" | "exportedAt">): ExportHistoryEntry {
  const record: ExportHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
  };
  const next = [record, ...readHistory().filter((item) => item.id !== record.id)];
  writeHistory(next);
  return record;
}

export function clearExportHistory(): void {
  localStorage.removeItem(EXPORT_HISTORY_KEY);
}
