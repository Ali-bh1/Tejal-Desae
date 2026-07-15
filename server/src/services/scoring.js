/**
 * services/scoring.js
 *
 * Server-side scoring engine for the Wealth Expansion Assessment.
 * Clients NEVER see this logic — it runs entirely on the backend.
 *
 * Categories:
 *   A = Safety / Guard
 *   B = Worthiness / Prover
 *   C = Visibility / Hider
 *   D = Receiving / Giver
 *   E = Ease / Gripper
 */

const ARCHETYPES = {
  A: {
    name:      'The Guard',
    tag:       'Deep down, more money feels risky — so you keep things safe and small.',
    theme:     'Safety & Security Patterns',
    // Hidden coaching notes (admin only)
    coaching:  'Focus on somatic safety installation before any abundance work. Nervous system dysregulation is the root. Do NOT use visualisation without body anchoring first — it will backfire.',
    flags:     { needs_somatic_grounding: true, trauma_adjacent: true },
  },
  B: {
    name:      'The Prover',
    tag:       'You quietly feel like you have to earn the right to have it.',
    theme:     'Worthiness & Deservability',
    coaching:  'Core wound is "I am not enough without earning it." Identity-level work needed before strategy. Watch for overdelivering in sessions — boundary work is essential.',
    flags:     { worthiness_wound: true, tends_to_overdeliver: true },
  },
  C: {
    name:      'The Hider',
    tag:       'Being seen feels risky, so you keep yourself a little small.',
    theme:     'Visibility & Exposure Safety',
    coaching:  'Visibility = danger at the nervous system level. May have history of being judged or shamed for shining. Gradual exposure protocol. Do not push visibility before safety is established.',
    flags:     { visibility_wound: true, requires_gradual_exposure: true },
  },
  D: {
    name:      'The Giver',
    tag:       'You\'re amazing at giving. Keeping it for yourself is the hard part.',
    theme:     'Receiving Capacity',
    coaching:  'Receiving = vulnerability. May have learned that giving = worth. Watch for deflection when complimented or acknowledged. Receiving practices are the primary intervention.',
    flags:     { receiving_block: true, giving_as_worth: true },
  },
  E: {
    name:      'The Gripper',
    tag:       'If you\'re not holding on tight, it feels like it\'ll slip away.',
    theme:     'Control & Ease Patterns',
    coaching:  'Hyper-control as survival strategy. Easy money = fake/risky. Rest = dangerous. Watch for burnout patterns. Nervous system needs co-regulation before ease can be installed.',
    flags:     { control_pattern: true, burnout_risk: true, ease_blocked: true },
  },
};

const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

// Questions in order — used to validate incoming answers server-side
const QUESTION_COUNT = 8;

// Maximum possible score per category (all 8 answers pointing to same category)
const MAX_POSSIBLE = QUESTION_COUNT;

/**
 * Score a submitted set of answers.
 *
 * @param {string[]} answers  Array of 8 answer codes e.g. ["A","C","B","D","E","A","B","C"]
 * @returns {{
 *   categoryScores:  {[cat: string]: number},
 *   topArchetype:    string,
 *   expansionScore:  number,   // 0-100 client-visible
 *   archetype:       object,   // public archetype data
 *   coachingNotes:   string,   // admin only
 *   internalFlags:   object,   // admin only
 *   sortedCategories: {cat: string, score: number, pct: number}[]
 * }}
 */
export function scoreAssessment(answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTION_COUNT) {
    throw new Error(`Expected ${QUESTION_COUNT} answers, received ${answers.length}`);
  }

  // Count scores per category
  const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const ans of answers) {
    const upper = String(ans).toUpperCase();
    if (CATEGORIES.includes(upper)) {
      scores[upper]++;
    }
  }

  // Find dominant archetype (ties broken alphabetically — consistent)
  const topCat = CATEGORIES.reduce((best, cat) =>
    scores[cat] > scores[best] ? cat : best
  , 'A');

  // Expansion score: percentage of answers pointing to dominant category
  // This is the CLIENT-VISIBLE score (0-100)
  const topScore       = scores[topCat];
  const totalAnswers   = answers.length;
  const expansionScore = Math.round((topScore / totalAnswers) * 100);

  // Sorted categories for the expansion map (bars on report)
  const maxScore = Math.max(...CATEGORIES.map(c => scores[c]), 1);
  const sortedCategories = CATEGORIES
    .map(cat => ({
      cat,
      score: scores[cat],
      pct:   Math.round(scores[cat] / maxScore * 100),
    }))
    .sort((a, b) => b.score - a.score);

  const archetype = ARCHETYPES[topCat];

  return {
    categoryScores:  scores,
    topArchetype:    topCat,
    expansionScore,
    archetype: {
      name: archetype.name,
      tag:  archetype.tag,
      theme: archetype.theme,
    },
    // Admin-only fields
    coachingNotes:   archetype.coaching,
    internalFlags:   archetype.flags,
    sortedCategories,
  };
}

/**
 * Validate that all answers are valid category codes.
 */
export function validateAnswers(answers) {
  if (!Array.isArray(answers)) return false;
  if (answers.length !== QUESTION_COUNT) return false;
  return answers.every(a =>
    CATEGORIES.includes(String(a).toUpperCase())
  );
}

export { ARCHETYPES, CATEGORIES, QUESTION_COUNT };
