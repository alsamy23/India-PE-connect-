/**
 * Utility functions for parsing fitness test values, calculating exact BMI,
 * determining age/gender appropriate BMI levels, and calculating dynamic test trends.
 */

export interface BMICalculationResult {
  bmi: number;               // e.g. 14.3
  weightKg?: number;         // e.g. 28
  heightCm?: number;         // e.g. 140
  category: string;          // e.g. "Normal Weight" or "Underweight"
  level: string;             // e.g. "Level 1: Underweight (< 18.5)", "Level 2: Normal (18.5 - 24.9)", etc.
  rating: 'Excellent' | 'Satisfactory' | 'Needs Improvement';
  formattedDisplay: string;  // e.g. "14.3 kg/m² (Normal Weight) • [28kg / 140cm]"
  details: string;
  badgeBg: string;           // Tailwind class e.g. "bg-emerald-100 text-emerald-800"
  gaugePercent: number;      // 0 to 100 for visual spectrum bar
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
 * Supports standard thresholds: <18.5 (Underweight), 18.5–24.9 (Normal), 25.0–29.9 (Overweight), 30.0–34.9 (Obese Class I), >=35.0 (Obese Class II).
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
      level: 'Level 0: Unspecified',
      rating: 'Satisfactory',
      formattedDisplay: 'N/A',
      details: 'No weight or height measurements provided.',
      badgeBg: 'bg-slate-100 text-slate-600',
      gaugePercent: 0
    };
  }

  // CBSE & WHO Pediatric & General BMI Thresholds
  let category = 'Normal Weight';
  let level = 'Level 2: Healthy Weight (18.5 - 24.9)';
  let rating: 'Excellent' | 'Satisfactory' | 'Needs Improvement' = 'Excellent';
  let details = 'Optimal body-mass index for physical development and athletic endurance under CBSE HPE standards.';
  let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let gaugePercent = 50;

  if (bmi < 16.5) {
    category = 'Severe Underweight';
    level = 'Level 1A: Severe Underweight (< 16.5)';
    rating = 'Needs Improvement';
    details = 'BMI is significantly below recommended guidelines (< 16.5). Nutrient-dense high-protein meal planning and medical consultation advised.';
    badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
    gaugePercent = Math.max(5, Math.min(25, (bmi / 18.5) * 25));
  } else if (bmi < 18.5) {
    category = 'Underweight';
    level = 'Level 1B: Mild Underweight (16.5 - 18.4)';
    rating = 'Needs Improvement';
    details = 'BMI is below age-recommended standard (< 18.5). Balanced nutrition and progressive strength training recommended.';
    badgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
    gaugePercent = 20 + ((bmi - 16.5) / 2) * 10;
  } else if (bmi <= 24.9) {
    category = 'Normal Weight';
    level = 'Level 2: Healthy Weight (18.5 - 24.9)';
    rating = 'Excellent';
    details = 'Outstanding physical stature! Ideal body-mass index for healthy growth and high-performance physical play under CBSE Khelo India benchmarks.';
    badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    gaugePercent = 30 + ((bmi - 18.5) / 6.4) * 25;
  } else if (bmi <= 29.9) {
    category = 'Overweight';
    level = 'Level 3: Overweight (25.0 - 29.9)';
    rating = 'Needs Improvement';
    details = 'BMI is above normal range (25.0 - 29.9). Daily structured cardio activity, active physical play, and dietary moderation advised.';
    badgeBg = 'bg-orange-100 text-orange-900 border-orange-300';
    gaugePercent = 55 + ((bmi - 25.0) / 4.9) * 20;
  } else if (bmi <= 34.9) {
    category = 'Obese Class I';
    level = 'Level 4: Obese Class I (30.0 - 34.9)';
    rating = 'Needs Improvement';
    details = 'BMI exceeds standard range (30.0 - 34.9). Daily 45-minute moderate cardio play, HPE teacher guidance, and lifestyle adjustments recommended.';
    badgeBg = 'bg-red-100 text-red-900 border-red-300';
    gaugePercent = 75 + ((bmi - 30.0) / 4.9) * 15;
  } else {
    category = 'Obese Class II';
    level = 'Level 5: Obese Class II / Severe (≥ 35.0)';
    rating = 'Needs Improvement';
    details = 'BMI significantly exceeds normal levels (≥ 35.0). Tailored low-impact exercise (swimming, walking) and clinical nutrition support recommended.';
    badgeBg = 'bg-purple-100 text-purple-900 border-purple-300';
    gaugePercent = Math.min(98, 90 + ((bmi - 35) / 10) * 8);
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
    level,
    rating,
    formattedDisplay,
    details,
    badgeBg,
    gaugePercent
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
                  testId === 'sprint_25m' || 
                  testId === 'sprint_30m' || 
                  testId === 'shuttle_4x10' || 
                  testId === 'shuttle_run' || 
                  testId === 'run_600m' || 
                  testId === 'run_long' || 
                  testName.toLowerCase().includes('sprint') || 
                  testName.toLowerCase().includes('race') || 
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

export interface DescriptiveFieldInfo {
  label: string;          // e.g. "Completed Repetitions (60s)" or "Time (seconds)" or "Mass & Height (kg / cm)"
  shortLabel: string;     // e.g. "Reps (60s)" or "Secs"
  placeholder: string;    // e.g. "e.g. 25 reps" or "e.g. 28/140" or "e.g. 8.42 sec"
  hint: string;           // e.g. "Total valid push-up reps completed in 60s"
  unitBadge: string;      // e.g. "Reps / 60s"
}

/**
 * Returns contextually descriptive labels, placeholders, and hints for any fitness test.
 * Solves user confusion between generic 'Count', 'Weight', or 'Seconds'.
 */
export function getDescriptiveFieldInfo(test: {
  id?: string;
  name?: string;
  unit?: string;
  duration?: string;
}): DescriptiveFieldInfo {
  const id = (test.id || '').toLowerCase();
  const name = (test.name || '').toLowerCase();
  const unit = (test.unit || '').toLowerCase();
  const duration = test.duration || '';

  // 1. BMI / Height & Weight
  if (id === 'bmi' || name.includes('bmi') || name.includes('height & weight') || (name.includes('height') && name.includes('weight'))) {
    return {
      label: 'Weight (kg) / Height (cm)',
      shortLabel: 'wt/ht (kg/cm)',
      placeholder: 'e.g. 28/140 (wt/ht)',
      hint: 'Enter Weight in kg and Height in cm separated by a slash (e.g. 28/140)',
      unitBadge: 'kg & cm'
    };
  }

  // 2. Push-ups / Modified Push-ups
  if (id === 'pushups' || name.includes('push-up') || name.includes('push up')) {
    return {
      label: 'Completed Repetitions (60s)',
      shortLabel: 'Reps (60s)',
      placeholder: 'e.g. 22 reps in 60s',
      hint: 'Count total valid push-up repetitions in 1 minute (60 seconds)',
      unitBadge: 'Reps in 60s'
    };
  }

  // 3. Curl-ups / Partial Curl-ups
  if (id === 'curl_ups' || name.includes('curl-up') || name.includes('curl up')) {
    return {
      label: 'Curl-Up Repetitions (30s / 60s)',
      shortLabel: 'Reps (30s/60s)',
      placeholder: 'e.g. 18 reps (30s) or 32 (60s)',
      hint: 'Count total valid partial curl-ups (Official Khelo India: 30 seconds; CBSE: 60s cadence)',
      unitBadge: 'Reps'
    };
  }

  // 4. Plate Tapping
  if (id === 'plate_tapping' || name.includes('plate tap') || name.includes('tapping')) {
    return {
      label: 'Completed Disc Taps (30s)',
      shortLabel: 'Taps (30s)',
      placeholder: 'e.g. 35 taps in 30s',
      hint: 'Count total back-and-forth taps between discs in 30 seconds',
      unitBadge: 'Taps in 30s'
    };
  }

  // 5. Flamingo Balance
  if (id === 'flamingo' || name.includes('flamingo') || name.includes('balance')) {
    return {
      label: 'Balance Disruption / Falls (60s)',
      shortLabel: 'Falls (60s)',
      placeholder: 'e.g. 2 stumbles',
      hint: 'Count total stumbles / foot touches during 60-second trial',
      unitBadge: 'Falls in 60s'
    };
  }

  // 6. Sit & Reach
  if (id === 'sit_reach' || name.includes('sit & reach') || name.includes('reach') || name.includes('flexibility')) {
    return {
      label: 'Flexibility Distance (cm)',
      shortLabel: 'Distance (cm)',
      placeholder: 'e.g. 18.5 cm',
      hint: 'Maximum forward stretch distance reached along measuring box in cm',
      unitBadge: 'cm'
    };
  }

  // 7. Standing Broad Jump
  if (id === 'broad_jump' || name.includes('broad jump') || name.includes('long jump') || name.includes('jump')) {
    return {
      label: 'Jump Distance (cm)',
      shortLabel: 'Distance (cm)',
      placeholder: 'e.g. 165 cm',
      hint: 'Distance in cm from take-off line to back of heel landing',
      unitBadge: 'cm'
    };
  }

  // 8. 25m Sprint / Race
  if (id === 'sprint_25m' || name.includes('25m') || name.includes('25-m') || name.includes('25 meter') || name.includes('25-meter')) {
    return {
      label: '25m Sprint Time (seconds)',
      shortLabel: 'Time (25m s)',
      placeholder: 'e.g. 5.12 sec',
      hint: 'Recorded duration in seconds (0.01s precision) over 25m track from standing start',
      unitBadge: 'Seconds (0.01s)'
    };
  }

  // 9. 30m Sprint / Race
  if (id === 'sprint_30m' || name.includes('30m') || name.includes('30-m') || name.includes('30 meter') || name.includes('30-meter')) {
    return {
      label: '30m Sprint Time (seconds)',
      shortLabel: 'Time (30m s)',
      placeholder: 'e.g. 5.85 sec',
      hint: 'Recorded duration in seconds (0.01s precision) over 30m track from standing start',
      unitBadge: 'Seconds (0.01s)'
    };
  }

  // 10. 50m Sprint / Dash
  if (id === 'sprint_50m' || name.includes('50m') || name.includes('dash') || name.includes('sprint') || name.includes('race')) {
    return {
      label: 'Sprint Time (seconds)',
      shortLabel: 'Time (seconds)',
      placeholder: 'e.g. 8.42 sec',
      hint: 'Recorded duration in seconds (0.01s precision) from standing start',
      unitBadge: 'Seconds (0.01s)'
    };
  }

  // 9. Shuttle Run (4x10m)
  if (id === 'shuttle_run' || id === 'shuttle_4x10' || name.includes('shuttle')) {
    return {
      label: 'Shuttle Duration (seconds)',
      shortLabel: 'Time (seconds)',
      placeholder: 'e.g. 11.20 sec',
      hint: 'Total duration in seconds to run 4x10m picking up wooden blocks',
      unitBadge: 'Seconds'
    };
  }

  // 10. 600m Run/Walk or Long Distance Run (1000m / 800m)
  if (id === 'run_600m' || id === 'run_long' || name.includes('600m') || name.includes('1000m') || name.includes('800m') || (name.includes('run') && !name.includes('shuttle'))) {
    return {
      label: 'Run Duration (MM:SS)',
      shortLabel: 'Time (MM:SS)',
      placeholder: 'e.g. 2:45 (min:sec)',
      hint: 'Total continuous running time in minutes and seconds (e.g. 2:45)',
      unitBadge: 'MM:SS'
    };
  }

  // Generic fallback checks based on unit or duration
  if (unit === 'count' || unit === 'reps') {
    const timeInLabel = duration.includes('30') ? '30s' : duration.includes('60') || duration.includes('1 Min') ? '60s' : '';
    return {
      label: `Completed Repetitions ${timeInLabel ? `(${timeInLabel})` : ''}`.trim(),
      shortLabel: `Reps ${timeInLabel ? `(${timeInLabel})` : ''}`.trim(),
      placeholder: `e.g. 25 reps`,
      hint: `Enter total completed rep count`,
      unitBadge: timeInLabel ? `Reps / ${timeInLabel}` : 'Reps'
    };
  }

  if (unit === 'seconds' || unit === 'sec' || unit === 's') {
    return {
      label: 'Duration (seconds)',
      shortLabel: 'Time (seconds)',
      placeholder: 'e.g. 12.5 sec',
      hint: 'Enter total time duration in seconds',
      unitBadge: 'Seconds'
    };
  }

  if (unit === 'min:sec' || unit === 'minutes') {
    return {
      label: 'Duration (MM:SS)',
      shortLabel: 'Time (MM:SS)',
      placeholder: 'e.g. 3:15',
      hint: 'Enter time in minutes and seconds (MM:SS)',
      unitBadge: 'MM:SS'
    };
  }

  if (unit === 'cm' || unit === 'meters' || unit === 'm') {
    return {
      label: `Distance (${unit})`,
      shortLabel: `Distance (${unit})`,
      placeholder: `e.g. 150 ${unit}`,
      hint: `Enter measured distance in ${unit}`,
      unitBadge: unit
    };
  }

  return {
    label: `Score (${test.unit || 'Value'})`,
    shortLabel: test.unit || 'Score',
    placeholder: `Enter ${test.unit || 'score'}`,
    hint: `Enter student score in ${test.unit || 'units'}`,
    unitBadge: test.unit || 'Units'
  };
}
