// lib/hasColumn.ts
import { query } from "@/lib/db";

export async function hasColumn(table: string, column: string) {
  const rows = await query<any>(
    `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = ?
        AND COLUMN_NAME  = ?
      LIMIT 1`,
    [table, column]
  );
  return rows.length > 0;
}
