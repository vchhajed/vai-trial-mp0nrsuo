import postgres from 'postgres';
import { SignJWT, jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'namo-steel-secret-change-in-prod'
);

function getDB() {
  return postgres(process.env.POSTGRES_URL, { ssl: 'require', max: 1 });
}

// POST /api/auth  { slug, password } → { token, company }
export async function POST(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 503 });
  try {
    const { slug, password } = await request.json();
    if (!slug || !password)
      return Response.json({ ok: false, error: 'Missing credentials' }, { status: 400 });

    const db = getDB();
    const rows = await db`SELECT id, name, slug, email, logo_url, industry FROM companies WHERE slug = ${slug} AND password = ${password}`;
    await db.end();

    if (rows.length === 0)
      return Response.json({ ok: false, error: 'Invalid company ID or password' }, { status: 401 });

    const company = rows[0];
    const token = await new SignJWT({ companyId: company.id, slug: company.slug })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(SECRET);

    return Response.json({ ok: true, token, company });
  } catch (err) {
    console.error('[auth POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

// GET /api/auth?token=xxx → { ok, company }
export async function GET(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return Response.json({ ok: false }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const db = getDB();
    const rows = await db`SELECT id, name, slug, email, logo_url, industry FROM companies WHERE id = ${payload.companyId}`;
    await db.end();

    if (rows.length === 0) return Response.json({ ok: false }, { status: 401 });
    return Response.json({ ok: true, company: rows[0] });
  } catch {
    return Response.json({ ok: false }, { status: 401 });
  }
}
