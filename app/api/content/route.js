import postgres from 'postgres';
import fileContent from '../../../data/content.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getDB() {
  return postgres(process.env.POSTGRES_URL, { ssl: 'require', max: 1 });
}

async function ensureTable(db) {
  await db`CREATE TABLE IF NOT EXISTS site_config (key text PRIMARY KEY, value jsonb NOT NULL)`;
}

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return Response.json(fileContent);
  }
  try {
    const db = getDB();
    await ensureTable(db);
    const rows = await db`SELECT value FROM site_config WHERE key = 'ntl_content'`;
    await db.end();
    return Response.json(rows[0]?.value ?? fileContent, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[content GET]', err);
    return Response.json(fileContent);
  }
}

export async function POST(request) {
  if (!process.env.POSTGRES_URL) {
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  }
  try {
    const content = await request.json();
    const db = getDB();
    await ensureTable(db);
    await db`
      INSERT INTO site_config (key, value)
      VALUES ('ntl_content', ${db.json(content)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    await db.end();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[content POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
