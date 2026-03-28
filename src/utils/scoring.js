/**
 * Manasthiti Adaptive Scoring Engine
 *
 * 5 dimensions weighted as per PRD:
 * - Dimension 1: Mood & Energy (25%) — Q1, Q2
 * - Dimension 2: Sleep & Physical (20%) — Q3, Q4
 * - Dimension 3: Social Connection (20%) — Q5
 * - Dimension 4: Future Orientation (25%) — Q6, Q7/Q8
 * - Dimension 5: Risk Flags (10% + override) — Q9, Q10
 *
 * All computation runs client-side. No scores are transmitted.
 */

const DIMENSION_WEIGHTS = {
  1: 0.25, // Mood & Energy
  2: 0.20, // Sleep & Physical
  3: 0.20, // Social Connection
  4: 0.25, // Future Orientation
  5: 0.10, // Risk Flags
};

const DIMENSION_MAX = {
  1: 6,  // Q1 + Q2 (max 3 each)
  2: 6,  // Q3 + Q4
  3: 3,  // Q5
  4: 9,  // Q6 + Q7 or Q8 (max 3 each, up to 3 questions)
  5: 6,  // Q9 + Q10
};

export function calculateScore(answers) {
  const dimensionScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let hasRiskFlag = false;

  Object.entries(answers).forEach(([questionId, answer]) => {
    const { dimension, score, riskFlag } = answer;
    dimensionScores[dimension] += score;

    if (riskFlag && score > 0) {
      hasRiskFlag = true;
    }
  });

  // Calculate weighted total (normalized to ~0-24 range, then mapped)
  let totalScore = 0;
  Object.entries(dimensionScores).forEach(([dim, score]) => {
    const maxForDim = DIMENSION_MAX[dim];
    const normalized = maxForDim > 0 ? score / maxForDim : 0;
    totalScore += normalized * DIMENSION_WEIGHTS[dim] * 24; // scale to 24-point range
  });

  const rawTotal = Math.round(totalScore);

  return {
    rawTotal,
    dimensionScores,
    hasRiskFlag,
    tier: determineTier(rawTotal, hasRiskFlag),
    cohort: determineCohort(dimensionScores),
  };
}

export function determineTier(score, hasRiskFlag) {
  // Any risk flag > 0 = automatic Tier 4 override
  if (hasRiskFlag) return 4;

  // Conservative routing: boundary cases go to higher tier
  if (score >= 13) return 4;
  if (score >= 9) return 3;
  if (score >= 5) return 2;
  return 1;
}

export function determineCohort(dimensionScores) {
  const dim1 = dimensionScores[1]; // Mood
  const dim3 = dimensionScores[3]; // Social
  const dim4 = dimensionScores[4]; // Future

  // Determine primary cohort based on highest scoring dimension
  if (dim4 >= 5) {
    return dim4 > dim1 ? 'hopelessness' : 'academic';
  }
  if (dim3 >= 2) {
    return 'isolation';
  }
  if (dim1 >= 3) {
    return 'academic';
  }
  return 'lowMood';
}

// Generates a realistic-looking solidarity count for the cohort
// In production, this would come from aggregate backend data
export function getSolidarityCount(cohort) {
  const baseCounts = {
    academic: 8400,
    hopelessness: 12000,
    isolation: 6300,
    lowMood: 4200,
  };

  const base = baseCounts[cohort] || 5000;
  // Add some daily variance (±15%) to feel real
  const variance = Math.floor(base * 0.15 * (Math.random() * 2 - 1));
  return base + variance;
}

// Determine which questions to show based on branching logic
export function getQuestionFlow(answers) {
  const baseQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  // After Q6, branch based on context
  // For MVP, we show Q7 (academic) by default since target is 13-25 age group
  // Q8 (career) shown if user seems older / career-focused
  const branchQuestion = 'q7'; // Default to academic for Nepal youth

  const flow = [...baseQuestions, branchQuestion];

  // Risk flag questions (Q9-Q10) triggered if Dim 1 + Dim 4 score >= 4
  const dim1Score = (answers.q1?.score || 0) + (answers.q2?.score || 0);
  const dim4Score = (answers.q6?.score || 0) + (answers[branchQuestion]?.score || 0);

  if (dim1Score + dim4Score >= 4) {
    flow.push('q9', 'q10');
  }

  return flow;
}

export function shouldShowRiskQuestions(answers) {
  const dim1Score = (answers.q1?.score || 0) + (answers.q2?.score || 0);
  const dim4Score = (answers.q6?.score || 0) + (answers.q7?.score || 0) + (answers.q8?.score || 0);
  return dim1Score + dim4Score >= 4;
}
