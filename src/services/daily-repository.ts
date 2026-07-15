import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { drillResults } from '@/db/schema';
import { createId } from '@/utils/create-id';

const DAILY_DRILL_TYPE = 'daily-challenge';

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function loadDailyCompletionDates(): Promise<string[]> {
  const rows = await db
    .select({ detailsJson: drillResults.detailsJson })
    .from(drillResults)
    .where(eq(drillResults.drillType, DAILY_DRILL_TYPE));
  return rows
    .map((row) => {
      try {
        const details: unknown = JSON.parse(row.detailsJson ?? '{}');
        if (details !== null && typeof details === 'object' && 'date' in details) {
          const value = (details as { date: unknown }).date;
          return typeof value === 'string' ? value : null;
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((date): date is string => date !== null);
}

export async function saveDailyCompletion(
  isoDate: string,
  score: number,
  total: number,
): Promise<void> {
  await db.insert(drillResults).values({
    id: createId(),
    drillType: DAILY_DRILL_TYPE,
    playerId: null,
    score,
    total,
    detailsJson: JSON.stringify({ date: isoDate }),
    completedAt: new Date(),
  });
}
