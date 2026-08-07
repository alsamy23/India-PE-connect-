/**
 * Utility functions for parsing fitness test values, calculating exact BMI,
 * determining age/gender appropriate BMI levels, and calculating dynamic test trends.
 */

export interface BMICalculationResult {
  bmi: number;               // e.g. 14.3
  weightKg?: number;         // e.g. 28
  heightCm?: number;         // e.g. 140
  category: string;          // e.g. "Normal Weight (Healthy)" or "Underweight"
  rating: 'Excellent' | 'Satisfactory' | 'Needs Improvement';
  formattedDisplay: string;  // e.g. "14.3 kg/m² (Normal Weight) • [28kg / 140cm]"
  details: string;
}

/**
 * Safely parses any raw string input (like "28/140", "3:15", "12.5", "8/10") into a numeric value.
 */
export function parseFitnessValue(val: string | number): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  const clean = val.toString().trim();
  if (!clean) return 0;

  // Handle mm:ss time formats (e.g., 3:15 -> 3.25 minutes)
  if (clean.includes(':')) {
    const parts = clean.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] + parts[1] / 60;
    }
  }

  // Handle height/weight slash or comma format e.g. "28/140" or "28 / 140" or "28,140"
  if (clean.includes('/') || (clean.includes(',') && clean.split(',').length === 2)) {
    const parts = clean.split(/[\/,]/).map(p => parseFloat(p.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
      const weight = parts[0]; // kg
      const heightCm = parts[1]; // cm
      if (heightCm > 30) {
        const heightM = heightCm / 100;
        const computedBmi = weight / (heightM * heightM);
        return parseFloat(computedBmi.toFixed(1));
      }
    }
  }

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates exact BMI value and categorizes level based on standard school student guidelines (Khelo India / WHO / CBSE norms).
 */
export function calculateExactBMI(val: string | number): BMICalculationResult {
  const clean = (val ?? '').toString().trim();
  let weightKg: number | undefined;
  let heightCm: number | undefined;
  let bmi = 0;

  if (clean.includes('/') || (clean.includes(',') && clean.split(',').length === 2)) {
    const parts = clean.split(/[\/,]/).map(p => parseFloat(p.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
      weightKg = parts[0];
      heightCm = parts[1];
      const heightM = heightCm / 100;
      bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    }
  }

  if (bmi === 0) {
    bmi = parseFitnessValue(clean);
  }

  if (bmi <= 0) {
    return {
      bmi: 0,
      category: 'Not Recorded',
      rating: 'Satisfactory',
      formattedDisplay: 'N/A',
      details: 'No weight or height measurements provided.'
    };
  }

  // Standard student BMI categories (Indian School / CBSE / Khelo India & WHO pediatric guidelines)
  // Normal range for school children (ages 5-14) is typically 14.0 - 22.0 kg/m²
  let category = 'Normal Weight (Healthy)';
  let rating: 'Excellent' | 'Satisfactory' | 'Needs Improvement' = 'Excellent';
  let details = 'Optimal body-mass index for physical development and athletic endurance.';

  if (bmi < 14.0) {
    category = 'Underweight';
    rating = 'Needs Improvement';
    details = 'BMI is below age-recommended standard. Nutrient-rich high-protein diet and strength exercises recommended.';
  } else if (bmi <= 22.0) {
    category = 'Normal Weight (Healthy)';
    rating = 'Excellent';
    details = 'Outstanding physical stature! Ideal body-mass index for healthy growth and high-performance physical play.';
  } else if (bmi <= 26.0) {
    category = 'Overweight';
    rating = 'Needs Improvement';
    details = 'Body-mass index is above recommended guidelines. Daily active playtime and reduced processed snacks advised.';
  } else {
    category = 'Obese';
    rating = 'Needs Improvement';
    details = 'BMI significantly exceeds standard range. Structured daily cardio play & PE guidance recommended.';
  }

  let formattedDisplay = `${bmi} kg/m² (${category})`;
  if (weightKg !== undefined && heightCm !== undefined) {
    formattedDisplay = `${bmi} kg/m² (${category}) • [${weightKg}kg / ${heightCm}cm]`;
  }

  return {
    bmi,
    weightKg,
    heightCm,
    category,
    rating,
    formattedDisplay,
    details
  };
}

/**
 * Calculates dynamic progress trend (% change) between Baseline and latest recorded term.
 */
export function calculateTestTrend(
  testId: string,
  testName: string,
  termValues: Record<string, string>
): { text: string; isPositive: boolean; diffPct: number } {
  const termsOrder = ['Baseline', 'Term 1', 'Term 2', 'Final'];
  const recordedTerms = termsOrder.filter(t => termValues[t] && termValues[t] !== '-');

  if (recordedTerms.length <= 1) {
    return { text: 'Baseline', isPositive: true, diffPct: 0 };
  }

  const firstTerm = recordedTerms[0];
  const lastTerm = recordedTerms[recordedTerms.length - 1];

  const firstVal = parseFitnessValue(termValues[firstTerm]);
  const lastVal = parseFitnessValue(termValues[lastTerm]);

  if (firstVal === 0) {
    return { text: 'Recorded', isPositive: true, diffPct: 0 };
  }

  const isTimed = testId === 'sprint_50m' || 
                  testId === 'shuttle_4x10' || 
                  testId === 'run_600m' || 
                  testName.toLowerCase().includes('sprint') || 
                  testName.toLowerCase().includes('shuttle') || 
                  testName.toLowerCase().includes('run');

  let pctChange = 0;
  let isPositive = false;

  if (isTimed) {
    // For timed sprints/runs, lower duration is better
    pctChange = ((firstVal - lastVal) / firstVal) * 100;
    isPositive = pctChange >= 0;
  } else {
    // For distance, reps, flexibility, rubrics, higher is better
    pctChange = ((lastVal - firstVal) / firstVal) * 100;
    isPositive = pctChange >= 0;
  }

  const roundedPct = Math.abs(pctChange).toFixed(1);
  const sign = pctChange > 0 ? '+' : pctChange < 0 ? '-' : '';
  const text = `${sign}${roundedPct}%`;

  return { text, isPositive, diffPct: pctChange };
}

/**
 * Formats any test value for tabular display.
 */
export function formatTestDisplayValue(
  testName: string,
  testId: string,
  rawVal: string,
  unit: string
): string {
  if (!rawVal || rawVal === '-') return '-';

  const isBmi = testId === 'bmi' || testName.toLowerCase().includes('bmi');
  if (isBmi) {
    const bmiRes = calculateExactBMI(rawVal);
    return bmiRes.formattedDisplay;
  }

  if (unit === 'rating') {
    return `${rawVal}/10`;
  }

  return `${rawVal} ${unit || ''}`.trim();
}
