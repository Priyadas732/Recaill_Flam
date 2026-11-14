/**
 * Calculates per-section score, mastery levels, and identifies weak sections.
 * @param {Array<{ id: string, sectionId: string, answerIndex?: number, correctIndex?: number }>} questions
 * @param {Record<string, number>} answers - Map of questionId -> selectedOptionIndex
 * @param {Array<{ id: string, heading?: string, title?: string }>} sections
 */
export function calculateScores(questions = [], answers = {}, sections = []) {
  const sectionStats = {};

  for (const s of sections) {
    sectionStats[s.id] = {
      sectionId: s.id,
      title: s.heading || s.title || `Section ${s.id}`,
      total: 0,
      correct: 0,
      scorePct: 0,
      strength: 'weak', // 'strong' | 'moderate' | 'weak'
    };
  }

  let totalQuestions = questions.length;
  let totalCorrect = 0;

  for (const q of questions) {
    const targetIndex = q.answerIndex !== undefined ? q.answerIndex : q.correctIndex;
    const isCorrect = answers[q.id] === targetIndex;
    if (isCorrect) totalCorrect += 1;

    if (sectionStats[q.sectionId]) {
      sectionStats[q.sectionId].total += 1;
      if (isCorrect) {
        sectionStats[q.sectionId].correct += 1;
      }
    }
  }

  const sectionResults = Object.values(sectionStats).map((stat) => {
    const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    let strength = 'weak';
    if (pct >= 80) strength = 'strong';
    else if (pct >= 50) strength = 'moderate';

    return {
      ...stat,
      scorePct: pct,
      strength,
    };
  });

  const overallScorePct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const weakSections = sectionResults.filter((s) => s.strength === 'weak' || s.strength === 'moderate');

  return {
    totalQuestions,
    totalCorrect,
    overallScorePct,
    sectionResults,
    weakSections,
  };
}
