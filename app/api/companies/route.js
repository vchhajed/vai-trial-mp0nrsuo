import postgres from 'postgres';

export const dynamic = 'force-dynamic';

function getDB() {
  return postgres(process.env.POSTGRES_URL, { ssl: 'require', max: 1 });
}

async function ensureTable(db) {
  await db`
    CREATE TABLE IF NOT EXISTS companies (
      id          bigserial PRIMARY KEY,
      name        text NOT NULL,
      slug        text NOT NULL UNIQUE,
      email       text,
      password    text NOT NULL,
      logo_url    text,
      industry    text,
      created_at  timestamptz DEFAULT now()
    )
  `;
}

export async function GET() {
  if (!process.env.POSTGRES_URL) return Response.json([]);
  try {
    const db = getDB();
    await ensureTable(db);
    const rows = await db`SELECT id, name, slug, email, logo_url, industry, created_at FROM companies ORDER BY created_at DESC`;
    await db.end();
    return Response.json(rows);
  } catch (err) {
    console.error('[companies GET]', err);
    return Response.json([]);
  }
}

export async function POST(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const body = await request.json();
    if (!body.name || !body.slug || !body.password)
      return Response.json({ ok: false, error: 'name, slug and password are required' }, { status: 400 });

    const db = getDB();
    await ensureTable(db);
    const [row] = await db`
      INSERT INTO companies (name, slug, email, password, logo_url, industry)
      VALUES (${body.name}, ${body.slug.toLowerCase().replace(/\s+/g, '-')}, ${body.email ?? null}, ${body.password}, ${body.logo_url ?? null}, ${body.industry ?? null})
      RETURNING id, name, slug, email, logo_url, industry, created_at
    `;
    await db.end();
    return Response.json(row);
  } catch (err) {
    if (err.code === '23505') // unique violation on slug
      return Response.json({ ok: false, error: 'SLUG_TAKEN' }, { status: 409 });
    console.error('[companies POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { id, ...fields } = await request.json();
    const db = getDB();
    await db`
      UPDATE companies SET
        name      = COALESCE(${fields.name ?? null}, name),
        email     = COALESCE(${fields.email ?? null}, email),
        password  = COALESCE(${fields.password ?? null}, password),
        logo_url  = COALESCE(${fields.logo_url ?? null}, logo_url),
        industry  = COALESCE(${fields.industry ?? null}, industry)
      WHERE id = ${id}
    `;
    await db.end();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[companies PATCH]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!process.env.POSTGRES_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = getDB();
    await db`DELETE FROM companies WHERE id = ${id}`;
    await db.end();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[companies DELETE]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
