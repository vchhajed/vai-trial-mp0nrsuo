import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// GET /api/leads — fetch all leads
export async function GET() {
  if (!process.env.SUPABASE_URL) return Response.json([]);
  try {
    const { data, error } = await getSupabase()
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    console.error('[leads GET]', err);
    return Response.json([]);
  }
}

// POST /api/leads — insert a new lead
export async function POST(request) {
  if (!process.env.SUPABASE_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const body = await request.json();
    const { data, error } = await getSupabase()
      .from('leads')
      .insert({
        name:             body.name             ?? '',
        phone:            body.phone            ?? '',
        email:            body.email            ?? null,
        company:          body.company          ?? null,
        company_website:  body.company_website  ?? null,
        requirement:      body.requirement      ?? null,
        notes:            body.notes            ?? null,
        status:           body.status           ?? 'new',
        type:             body.type             ?? 'inbound',
        date:             body.date             ?? new Date().toLocaleDateString('en-IN'),
        quality:          body.quality          ?? 'warm',
        ref_link:         body.ref_link         ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    console.error('[leads POST]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

// PATCH /api/leads — update a lead by id
export async function PATCH(request) {
  if (!process.env.SUPABASE_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { id, ...fields } = await request.json();
    const allowed = ['name','phone','email','company','company_website','requirement','notes','status','type','quality','ref_link'];
    const update = Object.fromEntries(
      allowed.filter(k => fields[k] !== undefined).map(k => [k, fields[k]])
    );
    const { error } = await getSupabase()
      .from('leads')
      .update(update)
      .eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[leads PATCH]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

// DELETE /api/leads?id=X — delete a lead
export async function DELETE(request) {
  if (!process.env.SUPABASE_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { error } = await getSupabase()
      .from('leads')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[leads DELETE]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
