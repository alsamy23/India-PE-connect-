import { BoardType, LessonPlan, YearlyPlan, TheoryContent, Language, FitnessAssessment, BiomechanicsConcept } from "../types.ts";

// ── Streaming call — returns text via onChunk, resolves with full text ──────
export const callAIStream = async (
  payload: any,
  onChunk: (partial: string) => void
): Promise<string> => {
  const response = await fetch(`/api/ai/generate?t=${Date.now()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    let msg = "AI generation failed.";
    try { msg = JSON.parse(text)?.error || msg; } catch (_) {}
    throw new Error(msg);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.delta) {
            fullText = parsed.text || fullText;
            onChunk(fullText);
          }
          if (parsed.done) fullText = parsed.text || fullText;
        } catch (e: any) {
          if (e.message && !e.message.includes("JSON")) throw e;
        }
      }
    }
  }
  return fullText;
};

// ── Regular (non-streaming) call for JSON responses ───────────────────────
const callAIBase = async (payload: any, retries = 2): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`/api/ai/generate?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errMsg = `Server returned ${response.status}`;
      try {
        const errData = await response.json();
        errMsg = errData?.error || errData?.message || errMsg;
      } catch (_) {}
      const err: any = new Error(errMsg);
      if (retries > 0 && response.status >= 500) return callAIBase(payload, retries - 1);
      throw err;
    }

    const text = await response.text();
    if (!text) throw new Error("Empty response from server.");
    try { return JSON.parse(text); } catch (_) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") throw new Error("AI took too long. Please try a simpler request.");
    if (retries > 0) return callAIBase(payload, retries - 1);
    throw error;
  }
};

const safeParseJson = (text: string | undefined): any => {
  if (!text) throw new Error("AI response was empty.");
  let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try { return JSON.parse(clean); } catch (_) {
    const m = clean.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("AI response was malformed. Please try again.");
    try { return JSON.parse(m[0]); } catch (__) {
      throw new Error("AI generated an invalid format. Try simplifying your request.");
    }
  }
};

// ── Lesson Plan ─────────────────────────────────────────────────────────────
export const generateLessonPlan = async (
  board: BoardType, grade: string, sport: string, topic: string,
  teacherName: string, duration: string, date: string, language: Language
): Promise<LessonPlan> => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Detailed PE Lesson Plan. Board: ${board}, Grade: ${grade}, Sport: ${sport}, Topic: ${topic}, Lang: ${language}, Duration: ${duration}.`,
    config: {
      systemInstruction: `You are an expert Physical Education Curriculum Designer for Indian schools.
Create a highly professional, structured PE lesson plan for a ${duration} session.
Return ONLY valid JSON with these fields:
- objectives: {know, understand, beAbleTo}
- successCriteria: {all, most, some}
- starter: {time, title, description}
- mainActivity: {time, activities: [{title, description, coachingPoints[]}]}
- plenary: {time, title, description}
- equipment: string[]
- teachingAids: string[]
- safety: string[]
- keyVocabulary: string[]
- sen: {wave1, wave2, wave3}
- homework: string
- collaboration: string
- differentiation: string
- criticalThinking: string
- warmupDiagramPrompt: string
- explanationDiagramPrompt: string
- gameDiagramPrompt: string
Translate all content to ${language}. No empty fields.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Yearly Plan ──────────────────────────────────────────────────────────────
export const generateYearlyPlan = async (
  grade: string, board: BoardType, frequency: string, calendarText: string,
  term1Focus: string, term2Focus: string, startDate: string, duration: string, language: Language
): Promise<YearlyPlan> => {
  const safeCalendar = calendarText ? calendarText.substring(0, 1500) : "No calendar.";
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Yearly PE Plan. Grade: ${grade}, Board: ${board}, Lang: ${language}. Start: ${startDate}. Terms: 2. Focus1: ${term1Focus}. Focus2: ${term2Focus}. Holidays: ${safeCalendar}`,
    config: {
      systemInstruction: `Generate a yearly PE curriculum plan as JSON.
Structure: { grade, board, academicYear, terms: [{ termName, months: [{ monthName, weeks: [{ weekNumber, status, dates, topic, details }] }] }] }
Status enum: Instructional | Holiday | Exam | Event
Output language: ${language}. 2 terms. Populate all arrays fully.`,
      responseMimeType: "application/json",
    },
  });
  const parsed = safeParseJson(response.text);
  return {
    ...parsed,
    grade: parsed.grade || grade,
    board: parsed.board || board,
    duration,
    terms: Array.isArray(parsed.terms) ? parsed.terms : [],
    generatedDate: new Date().toLocaleDateString(),
    academicYear: parsed.academicYear || "2025-2026",
  };
};

// ── Mind Map ─────────────────────────────────────────────────────────────────
export const generateMindMap = async (grade: string, chapter: string, board: BoardType) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Mind map for CBSE Class ${grade} PE Chapter: ${chapter}. Board: ${board}.`,
    config: {
      systemInstruction: `Return JSON: { center: string, branches: [{ title, description, subTopics?: string[] }] }
6-8 main branches. Follow NCERT 2025-26 curriculum.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Theory Content ───────────────────────────────────────────────────────────
export const generateTheoryContent = async (
  grade: string, topic: string, board: BoardType, contentType: string, language: Language
): Promise<TheoryContent> => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `PE Theory Content. Grade ${grade} ${board}. Topic: ${topic}. Type: ${contentType}. Language: ${language}.`,
    config: {
      systemInstruction: `Expert CBSE PE Teacher. Return JSON: { title, contentType, content, questions: [{ question, answer, type }] }
Content Language: ${language}. Follow NCERT 2025-26. For Notes: bulleted, logical. For MCQ: challenging board-pattern options. For CaseStudy: scenario + 3-4 analytical questions.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── AI Tool Content ───────────────────────────────────────────────────────────
export const generateAIToolContent = async (toolId: string, params: any) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `PE Tool ${toolId}. Parameters: ${JSON.stringify(params)}.`,
    config: {
      systemInstruction: `PE Expert. Return JSON: { title, content, items?: string[], summary? }. High quality, actionable content.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Lesson Diagram (stub — Claude doesn't generate images) ───────────────────
export const generateLessonDiagram = async (_prompt: string, _context = "general") => {
  return undefined; // Image generation not available without Gemini
};

// ── Skill Progression ─────────────────────────────────────────────────────────
export const generateSkillProgression = async (sport: string, skill: string) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Skill progression: ${sport} - ${skill}`,
    config: {
      systemInstruction: `Return JSON: { skillName, level, phases: [{ phaseName, drills: string[], technicalFocus, diagramPrompt }] }
3-4 phases. Actionable drills. Coach-friendly language.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── State Regulations ─────────────────────────────────────────────────────────
export const getStateRegulationInsights = async (state: string, board: BoardType) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `PE regulations for ${state} ${board}. Marks, Hours, Curriculum.`,
    config: { systemInstruction: "PE curriculum expert. Provide clear, factual regulatory information." },
  });
  return response.text;
};

// ── Fitness Tests ─────────────────────────────────────────────────────────────
export const evaluateFitnessTests = async (
  age: string, gender: string, category: string, testName: string, value: string
): Promise<FitnessAssessment> => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Assess fitness: Category: ${category}. Test: ${testName}. Result: ${value}. Student: Age ${age}, ${gender}.`,
    config: {
      systemInstruction: `Sports Scientist. Return JSON: { studentName, age, gender, overallSummary, tests: [{ testName, score, percentile, rating, recommendation }] }
Rating enum: Needs Improvement | Average | Good | Excellent | Elite
Compare to ACSM/NSCA norms. Fully populate all fields.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Khelo India ───────────────────────────────────────────────────────────────
export const evaluateKheloIndiaScores = async (
  age: string, gender: string, tests: { name: string; value: string }[]
): Promise<FitnessAssessment> => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Assess fitness based on Khelo India Norms. Student: Age ${age}, ${gender}. Tests: ${JSON.stringify(tests)}.`,
    config: {
      systemInstruction: `Khelo India Assessor. Return JSON: { studentName, age, gender, overallSummary, tests: [{ testName, score, percentile, rating, recommendation }] }
Rating enum: Needs Improvement | Average | Good | Excellent | Elite
Compare to Indian National Fitness Protocols. If scores missing, estimate for average student of that age/gender and label "(Estimated)".`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Biomechanics ──────────────────────────────────────────────────────────────
export const explainBiomechanics = async (
  sport: string, concept: string, language: Language
): Promise<BiomechanicsConcept> => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Explain biomechanics concept '${concept}' in '${sport}'. Language: ${language}.`,
    config: {
      systemInstruction: `Return JSON: { concept, sportApplication, explanation, analogy, diagramPrompt }
Simple language for school students. Language: ${language}.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Rules Bot ─────────────────────────────────────────────────────────────────
export const getSportsRule = async (sport: string, query: string, language: Language) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Rule Check: ${sport}. Question: ${query}. Language: ${language}`,
    config: {
      systemInstruction: `Expert official for Indian sports (Kabaddi, Kho-Kho, Cricket, Football, etc). Provide specific rule numbers if possible. Concise. Language: ${language}.`,
    },
  });
  return response.text;
};

// ── NEW: Student Report Card ──────────────────────────────────────────────────
export const generateReportCard = async (
  studentName: string, grade: string, sport: string,
  performance: string, attendance: string, language: Language
) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Generate PE report card. Student: ${studentName}, Grade: ${grade}, Sport: ${sport}, Performance: ${performance}, Attendance: ${attendance}. Language: ${language}.`,
    config: {
      systemInstruction: `PE Teacher. Return JSON: { 
  studentName, grade, subject, academicYear,
  skills: [{ skillName, rating, comment }],
  overallGrade, teacherRemarks, areasOfStrength, areasForImprovement, targetForNextTerm
}
Rating values: Outstanding | Excellent | Good | Satisfactory | Needs Improvement
Language: ${language}. Professional tone. Encouraging and constructive.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── NEW: Substitute Teacher Plan ──────────────────────────────────────────────
export const generateSubstitutePlan = async (
  grade: string, duration: string, availableEquipment: string, language: Language
) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Emergency substitute PE lesson. Grade: ${grade}, Duration: ${duration}, Equipment available: ${availableEquipment}. Language: ${language}.`,
    config: {
      systemInstruction: `PE Expert. Return JSON: {
  title, gradeLevel, duration,
  warmup: { activity, duration, instructions },
  mainActivities: [{ name, duration, instructions, variations }],
  cooldown: { activity, duration, instructions },
  safetyNotes: string[],
  teacherTips: string[]
}
Keep it simple — no specialist equipment needed. Fun, safe, engaging. Language: ${language}.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── NEW: Sports Day Planner ───────────────────────────────────────────────────
export const generateSportsDayPlan = async (
  schoolName: string, grades: string, totalStudents: string,
  duration: string, theme: string, language: Language
) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Sports Day Plan. School: ${schoolName}, Grades: ${grades}, Students: ${totalStudents}, Duration: ${duration}, Theme: ${theme}. Language: ${language}.`,
    config: {
      systemInstruction: `PE Events Coordinator. Return JSON: {
  title, schoolName, theme, date,
  schedule: [{ time, event, venue, participants, coordinator, equipment }],
  events: [{ name, category, rules, equipment, prizes }],
  logistics: { setup, registration, refreshments, medical, photography },
  announcements: string[]
}
Professional Indian school sports day format. Language: ${language}.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── NEW: Parent Communication ──────────────────────────────────────────────────
export const generateParentLetter = async (
  studentName: string, purpose: string, details: string,
  teacherName: string, language: Language
) => {
  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Parent communication letter. Student: ${studentName}, Purpose: ${purpose}, Details: ${details}, Teacher: ${teacherName}. Language: ${language}.`,
    config: {
      systemInstruction: `PE Teacher writing to parent. Return JSON: {
  subject, greeting, body, actionRequired, closingRemarks, teacherName, date
}
Professional, warm, and clear tone. Language: ${language}. Indian school context.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};
