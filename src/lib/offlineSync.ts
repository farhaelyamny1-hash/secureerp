import { supabase } from "@/integrations/supabase/client";

const QUEUE_KEY = "secureerp_offline_queue";

interface QueuedAction {
  id: string;
  table: string;
  action: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  timestamp: number;
}

export function queueOfflineAction(action: Omit<QueuedAction, "id" | "timestamp">) {
  const queue = getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: QueuedAction[] = [];

  for (const item of queue) {
    try {
      let error: unknown = null;

      if (item.action === "insert") {
        const res = await (supabase.from(item.table as any) as any).insert(item.data);
        error = res.error;
      } else if (item.action === "update") {
        const { id, ...rest } = item.data;
        const res = await (supabase.from(item.table as any) as any).update(rest).eq("id", id);
        error = res.error;
      } else if (item.action === "delete") {
        const res = await (supabase.from(item.table as any) as any).delete().eq("id", item.data.id);
        error = res.error;
      }

      if (error) {
        console.error(`Sync failed for ${item.table}:`, error);
        remaining.push(item);
        failed++;
      } else {
        synced++;
      }
    } catch {
      remaining.push(item);
      failed++;
    }
  }

  if (remaining.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } else {
    clearQueue();
  }

  return { synced, failed };
}

// Auto-sync when coming back online
export function initOfflineSync() {
  const handleOnline = async () => {
    const queue = getQueue();
    if (queue.length > 0) {
      console.log(`🔄 Back online! Syncing ${queue.length} queued actions...`);
      const result = await syncOfflineQueue();
      console.log(`✅ Synced: ${result.synced}, ❌ Failed: ${result.failed}`);
    }
  };

  window.addEventListener("online", handleOnline);

  // Also try on load if online
  if (navigator.onLine) {
    handleOnline();
  }

  return () => window.removeEventListener("online", handleOnline);
}
