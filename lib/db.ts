import mysql from 'mysql2/promise';
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'laserzvar',
  connectionLimit: 10,
  waitForConnections: true
});
export async function query<T=any>(sql:string, params:any[]=[]): Promise<T[]> { const [rows] = await pool.query(sql, params); return rows as T[]; }
export async function execute(sql:string, params:any[]=[]){ const [res] = await pool.execute(sql, params); return res; }
