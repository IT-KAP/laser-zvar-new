import { NextResponse } from "next/server";
export function requireAdmin(req: Request){
  const key = req.headers.get('x-admin-key') || '';
  const pass = process.env.ADMIN_PASSWORD || 'admin';
  if (!key || key !== pass) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
