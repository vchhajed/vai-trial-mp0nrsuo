import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// GET /api/leads-pending
export async function GET() {
  if (!process.env.SUPABASE_URL) return Response.json([]);
  try {
    const { data, error } = await getSupabase()
      .from('leads_pending')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    console.error('[leads-pending GET]', err);
    return Response.json([]);
  }
}

// PATCH /api/leads-pending — action: approve | reject | duplicate
export async function PATCH(request) {
  if (!process.env.SUPABASE_URL)
    return Response.json({ ok: false, error: 'DB_NOT_CONFIGURED' }, { status: 500 });
  try {
    const { id, action, review_notes } = await request.json();
    const sb = getSupabase();

    const { data: pending, error: fetchErr } = await sb
      .from('leads_pending')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const now = new Date().toISOString();

    if (action === 'approve') {
      const score = pending.quality_score ?? 0;
      const { data: newLead, error: insertErr } = await sb
        .from('leads')
        .insert({
          name:            pending.name            ?? '',
          phone:           pending.phone           ?? '',
          email:           pending.email           ?? null,
          company:         pending.company         ?? null,
          company_website: pending.company_website ?? null,
          requirement:     pending.requirement     ?? null,
          notes:           pending.notes           ?? null,
          ref_link:        pending.ref_link        ?? pending.source_url ?? null,
          source:          pending.source          ?? null,
          source_url:      pending.source_url      ?? null,
          signal_type:     pending.signal_type     ?? null,
          metadata:        pending.metadata        ?? {},
          product_sku:     pending.product_sku     ?? null,
          status:          'new',
          type:            'outbound',
          quality:         score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
          date:            new Date().toLocaleDateString('en-IN'),
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      const { error: updErr } = await sb
        .from('leads_pending')
        .update({ review_status: 'approved', reviewed_at: now, reviewed_by: 'admin', review_notes: review_notes ?? null, promoted_lead_id: newLead.id, updated_at: now })
        .eq('id', id);
      if (updErr) throw updErr;
      return Response.json({ ok: true, lead_id: newLead.id });
    }

    const newStatus = action === 'reject' ? 'rejected' : 'duplicate';
    const { error: updErr } = await sb
      .from('leads_pending')
      .update({ review_status: newStatus, reviewed_at: now, reviewed_by: 'admin', review_notes: review_notes ?? null, updated_at: now })
      .eq('id', id);
    if (updErr) throw updErr;
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[leads-pending PATCH]', err);
    return Response.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
