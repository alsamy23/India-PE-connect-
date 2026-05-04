
import { BoardType, LessonPlan, YearlyPlan, TheoryContent, Language, FitnessAssessment, BiomechanicsConcept, TestPaper } from "../types.ts";

// ── callAIBase ─────────────────────────────────────────────────────────────
// Using the sophisticated version from origin (HEAD)
const callAIBase = async (payload: any, retries = 2) => {
  if (!navigator.onLine) {
    throw new Error("No Internet Connection: Please check your network settings and try again.");
  }

  if (payload.model === 'gemini-flash-latest' || payload.model === 'claude-sonnet') {
    payload.model = 'gemini-1.5-flash'; 
  }
  
  if (!payload.config) payload.config = {};
  const supportsThinking = payload.model && payload.model.includes("gemini-2.0");
  
  if (supportsThinking && !payload.config.thinkingConfig) {
    payload.config.thinkingConfig = { thinkingLevel: 'LOW' };
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); 
  
  try {
    const response = await fetch(`/api/ai/generate?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any = null;
      let responseText = "";
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (e) {
        console.error("Could not parse error response as JSON", e);
      }
      
      const errorMessage = typeof errorData?.error === 'string' ? errorData.error : (errorData?.error?.message || errorData?.message || responseText || `Server returned ${response.status}: ${response.statusText}`);
      
      const isQuotaError = response.status === 429 || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.toLowerCase().includes("quota");
      if (isQuotaError) {
        throw new Error("AI Quota Exceeded: You've reached the daily limit for the free version of Gemini. Please try again in a few hours or use a different API key with a paid project.");
      }

      const isInvalidKeyError = response.status === 401 || response.status === 400 || 
                               errorMessage.includes("API_KEY_INVALID") || 
                               errorMessage.includes("API key not valid") ||
                               errorMessage.toLowerCase().includes("expired") ||
                               errorMessage.toLowerCase().includes("invalid_argument");
      if (isInvalidKeyError) {
        if (window.aistudio) {
          try {
            await window.aistudio.openSelectKey();
            return await callAIBase(payload, 0);
          } catch (keySelectError: any) {
            throw new Error("API key selection was cancelled or failed. Please provide a valid key to continue.");
          }
        }
      }

      const error: any = new Error(errorMessage);
      if (errorData?.originalError) error.originalError = errorData.originalError;
      
      if (retries > 0 && response.status >= 500) {
        return callAIBase(payload, retries - 1);
      }
      throw error;
    }
    
    const text = await response.text();
    if (!text) throw new Error("Empty response from server.");
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned invalid JSON response: ${text.substring(0, 100)}`);
    }

    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error("The AI took too long to respond (Timeout). Please try a simpler request.");
    if (retries > 0) return callAIBase(payload, retries - 1);
    throw error;
  }
};

const safeParseJson = (data: any): any => {
  if (!data) throw new Error("AI response was empty.");
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    let cleanText = data.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanText);
    } catch (e) {
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("The AI response was malformed. Please try again.");
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        throw new Error("The AI generated an invalid format. Try simplifying your request.");
      }
    }
  }
  return data;
};

// ── Sanitize ─────────────────────────────────────────────────────────────
const sanitizeInput = (input: string, maxLength = 500): string => {
  if (!input) return '';
  return input.replace(/[<>{}|\\^`]/g, '').substring(0, maxLength).trim();
};

// ── Yearly Plan ───────────────────────────────────────────────────────────
export const generateYearlyPlan = async (
  grade: string,
  board: BoardType,
  frequency: string,
  calendarText: string,
  term1Focus: string,
  term2Focus: string,
  startDate: string,
  duration: string,
  language: Language
): Promise<YearlyPlan> => {
  const safeGrade = sanitizeInput(grade, 20);
  const safeTerm1 = sanitizeInput(term1Focus, 200);
  const safeTerm2 = sanitizeInput(term2Focus, 200);
  const safeDuration = sanitizeInput(duration, 30);
  const safeCalendar = calendarText ? sanitizeInput(calendarText, 1500) : "No extra holidays specified.";
  const startYear = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
  const academicYear = `${startYear}-${(startYear + 1).toString().slice(-2)}`;

  const response = await callAIBase({
    model: "gemini-1.5-flash",
    contents: `Generate a complete Indian school PE Yearly Plan for Grade ${safeGrade} (${board}) starting April ${startYear}. Language: ${language}. Sessions per week: ${frequency}. Session duration: ${safeDuration}. Term 1 games/focus: ${safeTerm1}. Term 2 games/focus: ${safeTerm2}. School calendar/holidays: ${safeCalendar}`,
    config: {
      systemInstruction: `You are an expert Indian School Physical Education curriculum planner.
Generate a complete week-wise yearly PE plan for the INDIAN ACADEMIC YEAR (April to March).

CRITICAL STRUCTURE RULES:
1. The academic year MUST run from APRIL to MARCH (12 months total).
2. Term 1 covers: April, May, June, July, August, September
   - SUMMER HOLIDAY BREAK: 3rd week of May to 1st week of June (status: "Holiday", topic: "Summer Vacation")
3. Term 2 covers: October, November, December, January, February, March
   - WINTER BREAK: last week of December / first week of January (status: "Holiday", topic: "Winter Break")
   - October usually has Dussehra/Pooja holidays (status: "Holiday")
4. Generate ALL 12 months in order: April, May, June, July, August, September, October, November, December, January, February, March
5. Each month must have 4-5 weeks. Include realistic date ranges (e.g. "Apr 1-5, ${startYear}").
6. Use the user-provided calendar text to mark any additional holidays accurately.

WEEK DATA STRUCTURE — every week must have ALL these fields:
{
  "weekNumber": <sequential 1 to ~48 across the full year>,
  "dates": "<Mon–Fri range e.g. Apr 1-5, ${startYear}>",
  "status": "Instructional | Holiday | Exam | Event",
  "topic": "<e.g. Football: Passing or Summer Vacation>",
  "sport": "<game name e.g. Football — empty string for non-instructional weeks>",
  "weeklySkill": "<specific skill e.g. Chest Pass technique — empty for non-instructional>",
  "description": "<2-3 sentences on HOW to teach this skill. E.g. Players stand in pairs 5m apart. Push ball from chest height, step forward and snap wrists downward. — empty for non-instructional>",
  "coachingNotes": "<Key coaching cues. E.g. Cue: elbows in, thumbs down. Watch for: wrist snap at release. — empty for non-instructional>",
  "details": "<supporting detail or context>"
}

GAME PLANNING — 2 sports per term with this progression per sport (3-5 weeks):
  Week 1: Introduction + basic rules of the sport
  Week 2: Fundamental Skill 1 with full description + coaching notes
  Week 3: Fundamental Skill 2 with full description + coaching notes
  Week 4: Combination drills / small-sided game
  Week 5: Assessment / match play / competition (if time permits)
- Fitness/Athletics weeks fill gaps between game units.
- Exam weeks: status = "Exam", topic = "Periodic Assessment"

Term 1 games to plan: ${safeTerm1}
Term 2 games to plan: ${safeTerm2}

OUTPUT JSON (strict):
{
  "grade": "${safeGrade}",
  "board": "${board}",
  "academicYear": "${academicYear}",
  "terms": [
    {
      "termName": "Term 1 (April – September ${startYear})",
      "games": ["<game1>", "<game2>"],
      "months": [
        { "monthName": "April ${startYear}", "weeks": [...] },
        { "monthName": "May ${startYear}", "weeks": [...] },
        { "monthName": "June ${startYear}", "weeks": [...] },
        { "monthName": "July ${startYear}", "weeks": [...] },
        { "monthName": "August ${startYear}", "weeks": [...] },
        { "monthName": "September ${startYear}", "weeks": [...] }
      ]
    },
    {
      "termName": "Term 2 (October ${startYear} – March ${startYear + 1})",
      "games": ["<game3>", "<game4>"],
      "months": [
        { "monthName": "October ${startYear}", "weeks": [...] },
        { "monthName": "November ${startYear}", "weeks": [...] },
        { "monthName": "December ${startYear}", "weeks": [...] },
        { "monthName": "January ${startYear + 1}", "weeks": [...] },
        { "monthName": "February ${startYear + 1}", "weeks": [...] },
        { "monthName": "March ${startYear + 1}", "weeks": [...] }
      ]
    }
  ]
}

Output language: ${language}. Do NOT skip any month. Return complete JSON only.`,
      responseMimeType: "application/json",
    },
  });

  const text = response?.text || (typeof response === 'string' ? response : JSON.stringify(response));
  const parsed = safeParseJson(text);

  if (!parsed || !Array.isArray(parsed.terms) || parsed.terms.length === 0) {
    throw new Error("AI generated an invalid yearly plan structure. Please try again.");
  }

  const normalizedTerms = parsed.terms.map((term: any) => ({
    termName: String(term.termName || ''),
    games: Array.isArray(term.games) ? term.games.map(String) : [],
    months: Array.isArray(term.months) ? term.months.map((month: any) => ({
      monthName: String(month.monthName || ''),
      weeks: Array.isArray(month.weeks) ? month.weeks.map((week: any, wi: number) => ({
        weekNumber: Number(week.weekNumber || wi + 1),
        dates: String(week.dates || ''),
        status: (['Instructional', 'Holiday', 'Exam', 'Event'].includes(week.status) ? week.status : 'Instructional') as 'Instructional' | 'Holiday' | 'Exam' | 'Event',
        topic: String(week.topic || ''),
        details: String(week.details || ''),
        sport: String(week.sport || ''),
        weeklySkill: String(week.weeklySkill || ''),
        description: String(week.description || ''),
        coachingNotes: String(week.coachingNotes || ''),
      })) : [],
    })) : [],
  }));

  return {
    grade: safeGrade,
    board: parsed.board || board,
    academicYear,
    duration: safeDuration,
    terms: normalizedTerms,
    generatedDate: new Date().toLocaleDateString('en-IN'),
  };
};

// ── Theory Master (Mind Map) ─────────────────────────────────────────────────
const CBSE_CURRICULUM: Record<string, Record<string, string[]>> = {
  "11": {
    "Changing Trends & Career in Physical Education": ["Concept, Aims & Objectives of Physical Education", "Development of Physical Education in India – Post Independence", "Changing Trends in Sports", "Career options in Physical Education", "Khelo-India Program and Fit-India Program"],
    "Olympic Value Education": ["Olympism – Concept and Olympics Values", "Olympic Value Education", "Ancient and Modern Olympics", "Olympics – Symbols, Motto, Flag, Oath, and Anthem", "Olympic Movement Structure"],
    "Yoga": ["Meaning and importance of Yoga", "Introduction to Astanga Yoga", "Yogic Kriyas (Shat Karma)", "Pranayama and its types", "Active Lifestyle and stress management through Yoga"],
    "Physical Education & Sports for CWSN": ["Concept of Disability and Disorder", "Types of Disability", "Disability Etiquette", "Aim and objectives of Adaptive Physical Education", "Role of various professionals for CWSN"],
    "Physical Fitness, Wellness": ["Meaning & importance of Wellness, Health, and Physical Fitness", "Components/Dimensions of Wellness, Health, and Physical Fitness", "Traditional Sports & Regional Games", "Leadership through Physical Activity and Sports", "Introduction to First Aid – PRICE"],
    "Test, Measurements & Evaluation": ["Define Test, Measurements and Evaluation", "Importance of Test, Measurements and Evaluation in Sports", "Calculation of BMI, Waist-Hip Ratio, Skin fold measurement", "Somato Types", "Measurements of health-related fitness"],
    "Fundamentals of Anatomy and Physiology in Sports": ["Definition and importance of Anatomy and Physiology", "Functions of Skeletal System", "Properties and Functions of Muscles", "Structure and Functions of Circulatory System", "Structure and Functions of Respiratory System"],
    "Fundamentals of Kinesiology and Biomechanics in Sports": ["Definition and Importance of Kinesiology and Biomechanics", "Principles of Biomechanics", "Kinetics and Kinematics in Sports", "Types of Body Movements", "Axis and Planes"],
    "Psychology and Sports": ["Definition & Importance of Psychology in Physical Education & Sports", "Developmental Characteristics at Different Stages of Development", "Adolescent Problems & their Management", "Team Cohesion and Sports", "Psychological Attributes: Attention, Resilience, Mental Toughness"],
    "Training & Doping in Sports": ["Concept and Principles of Sports Training", "Training Load: Over Load, Adaptation, and Recovery", "Warming-up & Limbering Down", "Concept of Skill, Technique, Tactics & Strategies", "Concept of Doping and its disadvantages"]
  },
  "12": {
    "Management of Sporting Events": ["Functions of Sports Events Management", "Various Committees & their Responsibilities", "Fixtures and their Procedures", "Intramural & Extramural tournaments", "Community sports program"],
    "Children and Women in Sports": ["Exercise guidelines of WHO", "Common postural deformities", "Women's participation in Sports", "Special consideration (menarche and menstrual dysfunction)", "Female athlete triad"],
    "Yoga as Preventive measure for Lifestyle Disease": ["Obesity – Asanas", "Diabetes – Asanas", "Asthma – Asanas", "Hypertension – Asanas", "Back Pain and Arthritis – Asanas"],
    "Physical Education & Sports for (CWSN)": ["Organisations promoting Disability Sports", "Concept of Classification and Divisioning in Sports", "Concept of Inclusion in sports", "Advantages of Physical Activities for CWSN", "Strategies to make Physical Activities accessible"],
    "Sports & Nutrition": ["Concept of balanced diet and nutrition", "Macro and Micro Nutrients", "Nutritive & Non-Nutritive Components of Diet", "Eating for Weight control", "Importance of Diet in Sports"],
    "Test and Measurement in Sports": ["Fitness Test – SAI Khelo India", "Measurement of Cardio-Vascular Fitness", "Computing Basal Metabolic Rate (BMR)", "Rikli & Jones – Senior Citizen Fitness Test", "Johnsen-Methney Test of Motor Educability"],
    "Physiology & Injuries in Sport": ["Physiological factors determining components of physical fitness", "Effect of exercise on the Muscular System", "Effect of exercise on the Cardio-Respiratory System", "Physiological changes due to aging", "Sports injuries: Classification"],
    "Biomechanics and Sports": ["Newton\'s Law of Motion", "Types of Levers", "Equilibrium – Dynamic & Static", "Friction & Sports", "Projectile in Sports"],
    "Psychology and Sports": ["Personality; its definition & types", "Motivation, its type & techniques", "Exercise Adherence", "Meaning, Concept & Types of Aggressions in Sports", "Psychological Attributes in Sports"],
    "Training in Sports": ["Concept of Talent Identification and Talent Development", "Introduction to Sports Training Cycle", "Types & Methods to Develop – Strength, Endurance, Speed", "Flexibility and Coordinative Ability", "Circuit Training"]
  }
};

export const generateMindMap = async (grade: string, chapter: string, board: BoardType) => {
  const gradeKey = grade === "11" ? "11" : "12";
  const exactTopics = CBSE_CURRICULUM[gradeKey]?.[chapter] || [];
  const topicsContext = exactTopics.length > 0
    ? `EXACT TOPICS from CBSE 2025-26 official curriculum:\n${exactTopics.map((t, i) => `${i+1}. ${t}`).join("\n")}`
    : `Chapter: ${chapter}`;

  const res = await callAIBase({
<<<<<<< HEAD
    model: "gemini-1.5-flash",
    contents: `Generate a detailed CBSE Class ${grade} PE Mind Map for: "${chapter}".
${topicsContext}
Return JSON: { "center": "${chapter}", "branches": [{ "title": string, "description": string, "subTopics": string[] }] }`,
    config: {
      systemInstruction: `CBSE PE Expert. Use EXACT curriculum topics provided. Each topic MUST be a branch. Return ONLY valid JSON.`,
=======
    model: "claude-sonnet",
    contents: `Generate a detailed CBSE Class ${grade} PE Mind Map for the chapter: "${chapter}".
${topicsContext}

Return EXACTLY this JSON structure:
{
  "center": "${chapter}",
  "branches": [
    {
      "title": "Topic Name",
      "description": "Brief overview of the topic",
      "subTopics": ["Sub-topic 1", "Sub-topic 2"]
    }
  ]
}`,
    config: {
      systemInstruction: `You are a CBSE Physical Education expert. 
1. Use the EXACT curriculum topics provided in the prompt.
2. Each topic MUST be a main branch.
3. Return ONLY valid JSON. No markdown formatting.`,
>>>>>>> 8356801 (fix: Theory Master mind map generation with curriculum fallback and robust 37-question extraction)
      responseMimeType: "application/json",
    },
  });

<<<<<<< HEAD
  const text = res?.text || (typeof res === 'string' ? res : JSON.stringify(res));
  const parsed = safeParseJson(text);

  if (!parsed || !Array.isArray(parsed.branches) || parsed.branches.length === 0) {
=======
  // Handle various response formats from the proxy
  const rawText = res?.text || (typeof res === 'string' ? res : JSON.stringify(res));
  const parsed = safeParseJson(rawText);

  if (!parsed || !Array.isArray(parsed.branches) || parsed.branches.length === 0) {
    // If AI failed to return branches, create a skeleton based on the curriculum
>>>>>>> 8356801 (fix: Theory Master mind map generation with curriculum fallback and robust 37-question extraction)
    if (exactTopics.length > 0) {
      return {
        center: chapter,
        branches: exactTopics.map(topic => ({
          title: topic,
          description: `Detailed study of ${topic} as per Class ${grade} curriculum.`,
          subTopics: []
        }))
      };
    }
    throw new Error("AI failed to generate curriculum branches. Please try again.");
  }
<<<<<<< HEAD
=======
  
>>>>>>> 8356801 (fix: Theory Master mind map generation with curriculum fallback and robust 37-question extraction)
  return parsed;
};

// ── Theory Content ───────────────────────────────────────────────────────────
export const generateTheoryContent = async (
  grade: string, topic: string, board: BoardType, contentType: string, language: Language
): Promise<TheoryContent> => {
  const gradeKey = grade === "11" ? "11" : "12";
  let exactContext = "";
  const cleanTopic = topic.replace("Full Chapter: ", "").trim();
  const lowerTopic = cleanTopic.toLowerCase();

  for (const [chapter, topics] of Object.entries(CBSE_CURRICULUM[gradeKey] || {})) {
    if (chapter.toLowerCase() === lowerTopic || topics.some(t => t.toLowerCase().includes(lowerTopic))) {
      exactContext = `Topic pertains to Chapter: "${chapter}". Follow latest NCERT Class ${grade} material.`;
      break;
    }
  }

  const res = await callAIBase({
    model: "gemini-1.5-flash",
    contents: `CBSE Class ${grade} PE ${contentType}: "${topic}". Lang: ${language}.${exactContext ? "\nContext: " + exactContext : ""}`,
    config: {
      systemInstruction: `Expert PE Teacher. Return JSON: { "title": string, "contentType": string, "content": string, "questions": [{ "question": string, "options": string[], "answer": string }] }
- Content MUST be a single string with \n for newlines.
- Use NCERT 2025-26 terminology.`,
      responseMimeType: "application/json",
    },
  });

  const text = res?.text || (typeof res === 'string' ? res : JSON.stringify(res));
  const parsed = safeParseJson(text);
  
  if (!parsed || (!parsed.content && (!parsed.questions || parsed.questions.length === 0))) {
    throw new Error("AI failed to generate content. Please try again.");
  }

<<<<<<< HEAD
=======
  const res = await callAIBase({
    model: "claude-sonnet",
    contents: `CBSE Class ${grade} PE ${contentType}: "${topic}". Language: ${language}.${exactContext ? "\n\nCurriculum Context: " + exactContext : ""}`,
    config: {
      systemInstruction: `You are an expert CBSE Physical Education Teacher specializing in current NCERT textbook content (2025-26 session).
Return JSON: { "title": string, "contentType": string, "content": string, "questions": [{ "question": string, "options": string[], "answer": string, "type": string }] }

CRITICAL RULES:
- "content" MUST be a single string. Use \n for newlines.
- Do NOT return "content" as an object or array.
- Use EXACT terminology from the latest NCERT Physical Education textbook for Class ${grade}.
- Content Language: ${language}
- For Notes: Provide high-quality, exam-ready notes with structured bullet points and headers.
- For MCQ: 5 questions (CBSE pattern), 4 options each, provide clear string answers.
- For CaseStudy: A realistic scenario followed by 4 questions.
- Maintain 100% academic integrity to NCERT material.`,
      responseMimeType: "application/json",
    },
  });

  const text = res?.text || (typeof res === 'string' ? res : JSON.stringify(res));
  const parsed = safeParseJson(text);
  
  if (!parsed || (!parsed.content && (!parsed.questions || parsed.questions.length === 0))) {
    throw new Error("AI failed to generate content for this topic. Please try again.");
  }

>>>>>>> 8356801 (fix: Theory Master mind map generation with curriculum fallback and robust 37-question extraction)
  return {
    title: parsed.title || topic,
    contentType: parsed.contentType || contentType,
    content: typeof parsed.content === 'string' ? parsed.content : '',
    questions: Array.isArray(parsed.questions) ? parsed.questions : []
  };
};

// ── Question Paper ────────────────────────────────────────────────────────────
export const generateQuestionPaper = async (
  grade: string, 
  chapters: string[], 
  testType: string,
  language: Language
) => {
  const isFullPaper = testType.toLowerCase().includes('term') || testType.toLowerCase().includes('final') || testType.toLowerCase().includes('pre-board');
  const maxMarks = isFullPaper ? 70 : 35;
  const timeAllowed = isFullPaper ? "3 Hours" : "1.5 Hours";

  const blueprint = isFullPaper 
    ? `37 QUESTIONS TOTAL (70 MARKS):
      Sec A: Q1-18 (1m MCQs)
      Sec B: Q19-24 (2m VSA - attempt 5)
      Sec C: Q25-30 (3m SA - attempt 5)
      Sec D: Q31-33 (4m Case Studies with 4 sub-MCQs each)
      Sec E: Q34-37 (5m LA - attempt 3)`
    : `15 QUESTIONS TOTAL (35 MARKS):
      Sec A: Q1-6 (1m MCQs)
      Sec B: Q7-8 (2m VSA)
      Sec C: Q9-13 (3m SA)
      Sec D: Q14-15 (5m LA)`;

  const response = await callAIBase({
    model: "gemini-1.5-flash",
    contents: `Create CBSE Class ${grade} PE ${testType}. Chapters: ${chapters.join(', ')}. Language: ${language}.
    ${blueprint}`,
    config: {
      systemInstruction: `Expert CBSE Assessor. Return JSON with 'sections' array.
      CRITICAL: Strictly follow the question counts in the blueprint. 
      For 70m: Section E MUST have 4 questions (Q34-37).`,
      responseMimeType: "application/json",
    },
  });

  const raw = response?.text || (typeof response === 'string' ? response : JSON.stringify(response));
  const parsed = safeParseJson(raw);
  return normalizeQuestionPaper(parsed, grade, testType, maxMarks, timeAllowed);
};

const normalizeQuestionPaper = (rawPaper: any, grade: string, testType: string, maxMarks: number, timeAllowed: string) => {
  const isFullPaper = maxMarks === 70;
  const specs = isFullPaper
    ? [
        { sectionId: 'A', heading: 'SECTION A', count: 18, marks: 1, instructions: 'Q1-18 carry 1 mark each.' },
        { sectionId: 'B', heading: 'SECTION B', count: 6, marks: 2, instructions: 'Q19-24 carry 2 marks each.' },
        { sectionId: 'C', heading: 'SECTION C', count: 6, marks: 3, instructions: 'Q25-30 carry 3 marks each.' },
        { sectionId: 'D', heading: 'SECTION D', count: 3, marks: 4, instructions: 'Q31-33 are Case Based.' },
        { sectionId: 'E', heading: 'SECTION E', count: 4, marks: 5, instructions: 'Q34-37 carry 5 marks each.' },
      ]
    : [
        { sectionId: 'A', heading: 'SECTION A', count: 6, marks: 1, instructions: 'Q1-6 carry 1 mark each.' },
        { sectionId: 'B', heading: 'SECTION B', count: 2, marks: 2, instructions: 'Q7-8 carry 2 marks each.' },
        { sectionId: 'C', heading: 'SECTION C', count: 5, marks: 3, instructions: 'Q9-13 carry 3 marks each.' },
        { sectionId: 'D', heading: 'SECTION D', count: 2, marks: 5, instructions: 'Q14-15 carry 5 marks each.' },
      ];

<<<<<<< HEAD
  let questionsPool: any[] = [];
=======
  // Build a flat, ordered question list from all AI sections
  // Improved extraction: check sections, top-level questions, and common AI response variations
  let questionsPool: any[] = [];
  
>>>>>>> 8356801 (fix: Theory Master mind map generation with curriculum fallback and robust 37-question extraction)
  if (Array.isArray(rawPaper?.sections)) {
    questionsPool = rawPaper.sections.flatMap((s: any) => s?.questions || []);
  } else if (Array.isArray(rawPaper?.questions)) {
    questionsPool = rawPaper.questions;
  }
<<<<<<< HEAD
=======

  const flattenedQuestions = questionsPool
    .map((question: any) => ({
      question: String(question?.question || '').trim(),
      marks: Number(question?.marks || 0),
      options: Array.isArray(question?.options) ? question.options.map((option: any) => String(option)) : undefined,
      answer: question?.answer ? String(question.answer) : undefined,
      caseStudyText: question?.caseStudyText ? String(question.caseStudyText).trim() : undefined,
      caseStudyImagePrompt: question?.caseStudyImagePrompt ? String(question.caseStudyImagePrompt).trim() : undefined,
      internalChoice: question?.internalChoice ? String(question.internalChoice).trim() : undefined,
      subQuestions: Array.isArray(question?.subQuestions) ? question.subQuestions.map((sq: any) => ({
        question: String(sq?.question || '').trim(),
        options: Array.isArray(sq?.options) ? sq.options.map((opt: any) => String(opt)) : [],
        answer: String(sq?.answer || '')
      })) : undefined,
      figureLabel: question?.figureLabel ? String(question.figureLabel).trim() : undefined,
      visuallyImpairedAlternative: question?.visuallyImpairedAlternative ? String(question.visuallyImpairedAlternative).trim() : undefined,
    }))
    .filter((question: any) => question.question);
>>>>>>> 8356801 (fix: Theory Master mind map generation with curriculum fallback and robust 37-question extraction)

  const flattened = questionsPool.filter(q => q && q.question);
  let cursor = 0;
  let runningNumber = 1;

  const normalizedSections = specs.map(spec => {
    const available = flattened.slice(cursor, cursor + spec.count);
    cursor += spec.count;

    while (available.length < spec.count) {
      available.push({ question: `[Placeholder Question ${runningNumber + available.length}]`, marks: spec.marks });
    }

    return {
      sectionId: spec.sectionId,
      heading: spec.heading,
      instructions: spec.instructions,
      questions: available.map(q => ({ ...q, marks: spec.marks, questionNumber: runningNumber++ }))
    };
  });

  return {
    title: "PHYSICAL EDUCATION (048)",
    grade,
    testType,
    timeAllowed,
    maxMarks,
    generalInstructions: ["All questions are compulsory.", "Read carefully."],
    sections: normalizedSections
  };
};

// ── Other Helpers ────────────────────────────────────────────────────────────
export const generateLessonDiagram = async (prompt: string, context = 'general') => {
  if (!prompt) return undefined;
  const encoded = encodeURIComponent(`Sports diagram: ${prompt}`);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
};

export const generateAIToolContent = async (toolId: string, params: any) => {
  const response = await callAIBase({ model: 'gemini-1.5-flash', contents: `Tool ${toolId}: ${JSON.stringify(params)}` });
  return safeParseJson(response);
};

export const generateTestPaper = generateQuestionPaper; // Alias for compatibility
