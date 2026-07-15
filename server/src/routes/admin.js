/**
 * routes/admin.js — Admin dashboard API (all routes require auth)
 *
 * GET  /api/admin/dashboard        — overview stats
 * GET  /api/admin/leads            — paginated, searchable lead list
 * GET  /api/admin/leads/:id        — single lead detail
 * PATCH /api/admin/leads/:id/notes — update coaching notes
 * GET  /api/admin/leads/:id/submissions — assessment history for a lead
 * GET  /api/admin/submissions/:id  — full submission detail (with coaching data)
 * GET  /api/admin/export/csv       — export all leads as CSV
 */
import { Router } from 'express';
import { query }  from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { apiLimiter }  from '../middleware/rateLimiter.js';
import { notesRules, handleValidation } from '../middleware/validate.js';
import { body } from 'express-validator';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);
router.use(apiLimiter);

// ── Dashboard overview ────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [totalLeads, totalSubmissions, byProgram, byArchetype, recent] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM leads'),
      query('SELECT COUNT(*) AS count FROM assessment_submissions'),
      query(`
        SELECT program, COUNT(*) AS count
        FROM leads GROUP BY program ORDER BY count DESC
      `),
      query(`
        SELECT top_archetype, COUNT(*) AS count
        FROM assessment_submissions GROUP BY top_archetype ORDER BY count DESC
      `),
      query(`
        SELECT l.name, l.email, l.program, l.created_at,
               s.top_archetype, s.expansion_score
        FROM leads l
        LEFT JOIN LATERAL (
          SELECT top_archetype, expansion_score
          FROM assessment_submissions
          WHERE lead_id = l.id
          ORDER BY submitted_at DESC LIMIT 1
        ) s ON TRUE
        ORDER BY l.created_at DESC LIMIT 10
      `),
    ]);

    return res.json({
      totalLeads:        Number(totalLeads.rows[0].count),
      totalSubmissions:  Number(totalSubmissions.rows[0].count),
      byProgram:         byProgram.rows,
      byArchetype:       byArchetype.rows,
      recentLeads:       recent.rows,
    });
  } catch (err) {
    console.error('[admin/dashboard]', err.message);
    return res.status(500).json({ error: 'Could not load dashboard.' });
  }
});

// ── Lead list ─────────────────────────────────────────────────────
router.get('/leads', async (req, res) => {
  const page    = Math.max(1, parseInt(req.query.page)  || 1);
  const limit   = Math.min(100, parseInt(req.query.limit) || 25);
  const offset  = (page - 1) * limit;
  const search  = (req.query.search || '').trim();
  const program = req.query.program || null;
  const archetype = req.query.archetype || null;

  try {
    const conditions = [];
    const params = [];
    let p = 1;

    if (search) {
      conditions.push(`(l.name ILIKE $${p} OR l.email ILIKE $${p})`);
      params.push(`%${search}%`);
      p++;
    }
    if (program) {
      conditions.push(`l.program = $${p++}`);
      params.push(program);
    }
    if (archetype) {
      conditions.push(`s.top_archetype = $${p++}`);
      params.push(archetype.toUpperCase());
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*) AS total
       FROM leads l
       LEFT JOIN LATERAL (
         SELECT top_archetype FROM assessment_submissions
         WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1
       ) s ON TRUE
       ${where}`,
      params
    );
    const total = Number(countRes.rows[0].total);

    const dataRes = await query(
      `SELECT
         l.id, l.name, l.email, l.phone, l.program,
         l.created_at, l.updated_at, l.notes,
         s.top_archetype, s.expansion_score, s.submitted_at AS last_assessment
       FROM leads l
       LEFT JOIN LATERAL (
         SELECT top_archetype, expansion_score, submitted_at
         FROM assessment_submissions
         WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1
       ) s ON TRUE
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${p} OFFSET $${p+1}`,
      [...params, limit, offset]
    );

    return res.json({
      data:  dataRes.rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error('[admin/leads]', err.message);
    return res.status(500).json({ error: 'Could not load leads.' });
  }
});

// ── Single lead ───────────────────────────────────────────────────
router.get('/leads/:id', async (req, res) => {
  try {
    const leadRes = await query(
      `SELECT id, name, email, phone, program, created_at, updated_at, notes, source
       FROM leads WHERE id = $1`,
      [req.params.id]
    );
    if (!leadRes.rows.length) return res.status(404).json({ error: 'Lead not found.' });

    const subRes = await query(
      `SELECT id, program, top_archetype, expansion_score,
              category_scores, submitted_at
       FROM assessment_submissions WHERE lead_id = $1
       ORDER BY submitted_at DESC`,
      [req.params.id]
    );

    const histRes = await query(
      `SELECT viewed_at, ip_address FROM report_history
       WHERE lead_id = $1 ORDER BY viewed_at DESC LIMIT 20`,
      [req.params.id]
    );

    return res.json({
      lead:        leadRes.rows[0],
      submissions: subRes.rows,
      reportViews: histRes.rows,
    });
  } catch (err) {
    console.error('[admin/lead]', err.message);
    return res.status(500).json({ error: 'Could not load lead.' });
  }
});

// ── Update notes ──────────────────────────────────────────────────
router.patch(
  '/leads/:id/notes',
  notesRules,
  handleValidation,
  async (req, res) => {
    try {
      await query(
        `UPDATE leads SET notes = $1, updated_at = NOW() WHERE id = $2`,
        [req.body.notes || null, req.params.id]
      );
      await query(
        `INSERT INTO audit_log (admin_id, action, entity, entity_id, ip_address)
         VALUES ($1,'notes_updated','leads',$2,$3)`,
        [req.admin.id, req.params.id, req.ip]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('[admin/notes]', err.message);
      return res.status(500).json({ error: 'Could not update notes.' });
    }
  }
);

// ── Full submission detail (admin — includes coaching notes) ──────
router.get('/submissions/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT
         s.*,
         l.name, l.email, l.phone, l.program AS lead_program
       FROM assessment_submissions s
       JOIN leads l ON l.id = s.lead_id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Submission not found.' });

    // Audit
    await query(
      `INSERT INTO audit_log (admin_id, action, entity, entity_id, ip_address)
       VALUES ($1,'submission_viewed','assessment_submissions',$2,$3)`,
      [req.admin.id, req.params.id, req.ip]
    ).catch(() => {});

    return res.json(result.rows[0]); // includes coaching_notes, internal_flags
  } catch (err) {
    console.error('[admin/submission]', err.message);
    return res.status(500).json({ error: 'Could not load submission.' });
  }
});

// ── Update submission coaching notes ─────────────────────────────
router.patch(
  '/submissions/:id/notes',
  [body('coaching_notes').optional().trim().isLength({ max: 10000 }), handleValidation],
  async (req, res) => {
    try {
      await query(
        `UPDATE assessment_submissions SET coaching_notes = $1 WHERE id = $2`,
        [req.body.coaching_notes || null, req.params.id]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('[admin/sub-notes]', err.message);
      return res.status(500).json({ error: 'Could not update coaching notes.' });
    }
  }
);

// ── CSV Export ────────────────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const result = await query(
      `SELECT
         l.id, l.name, l.email, l.phone, l.program,
         l.created_at, l.notes,
         s.top_archetype, s.expansion_score,
         s.category_scores->>'A' AS score_a,
         s.category_scores->>'B' AS score_b,
         s.category_scores->>'C' AS score_c,
         s.category_scores->>'D' AS score_d,
         s.category_scores->>'E' AS score_e,
         s.submitted_at
       FROM leads l
       LEFT JOIN LATERAL (
         SELECT top_archetype, expansion_score, category_scores, submitted_at
         FROM assessment_submissions
         WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1
       ) s ON TRUE
       ORDER BY l.created_at DESC`
    );

    const headers = [
      'ID','Name','Email','Phone','Program','Signed Up','Notes',
      'Archetype','Expansion Score',
      'Safety (A)','Worthiness (B)','Visibility (C)','Receiving (D)','Ease (E)',
      'Assessment Date',
    ];

    const escape = v => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };

    const rows = result.rows.map(r => [
      r.id, r.name, r.email, r.phone || '', r.program,
      r.created_at?.toISOString() || '', r.notes || '',
      r.top_archetype || '', r.expansion_score || '',
      r.score_a || '0', r.score_b || '0', r.score_c || '0', r.score_d || '0', r.score_e || '0',
      r.submitted_at?.toISOString() || '',
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');

    await query(
      `INSERT INTO audit_log (admin_id, action, metadata, ip_address)
       VALUES ($1,'csv_export',$2,$3)`,
      [req.admin.id, JSON.stringify({ rows: result.rows.length }), req.ip]
    ).catch(() => {});

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="tejal-leads-${new Date().toISOString().slice(0,10)}.csv"`);
    return res.send(csv);

  } catch (err) {
    console.error('[admin/export]', err.message);
    return res.status(500).json({ error: 'Export failed.' });
  }
});

// ── Audit log ─────────────────────────────────────────────────────
router.get('/audit', async (req, res) => {
  const limit  = Math.min(200, parseInt(req.query.limit) || 50);
  const offset = Math.max(0,   parseInt(req.query.offset) || 0);
  try {
    const result = await query(
      `SELECT a.*, ad.email AS admin_email
       FROM audit_log a
       LEFT JOIN admins ad ON ad.id = a.admin_id
       ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[admin/audit]', err.message);
    return res.status(500).json({ error: 'Could not load audit log.' });
  }
});

export default router;
