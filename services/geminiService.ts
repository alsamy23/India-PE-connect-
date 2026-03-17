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
export const callAIBase = async (payload: any, retries = 2): Promise<any> => {
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
// ── CBSE 2025-26 Exact Curriculum Data from Official PDF ──────────────────
const CBSE_CURRICULUM: Record<string, Record<string, string[]>> = {
  "11": {
    "Changing Trends & Career in Physical Education": [
      "Concept, Aims & Objectives of Physical Education",
      "Development of Physical Education in India – Post Independence",
      "Changing Trends in Sports – playing surface, wearable gear, sports equipment, technological advancements",
      "Career options in Physical Education",
      "Khelo-India Program and Fit-India Program"
    ],
    "Olympic Value Education": [
      "Olympism – Concept and Olympics Values (Excellence, Friendship & Respect)",
      "Olympic Value Education – Joy of Effort, Fair Play, Respect for Others, Pursuit of Excellence, Balance Among Body, Will & Mind",
      "Ancient and Modern Olympics",
      "Olympics – Symbols, Motto, Flag, Oath, and Anthem",
      "Olympic Movement Structure – IOC, NOC, IFS, Other members"
    ],
    "Yoga": [
      "Meaning and importance of Yoga",
      "Introduction to Astanga Yoga",
      "Yogic Kriyas (Shat Karma)",
      "Pranayama and its types",
      "Active Lifestyle and stress management through Yoga"
    ],
    "Physical Education & Sports for CWSN": [
      "Concept of Disability and Disorder",
      "Types of Disability, its causes & nature (Intellectual disability, Physical disability)",
      "Disability Etiquette",
      "Aim and objectives of Adaptive Physical Education",
      "Role of various professionals for CWSN (Counselor, Occupational Therapist, Physiotherapist, PE Teacher, Speech Therapist, Special Educator)"
    ],
    "Physical Fitness, Wellness": [
      "Meaning & importance of Wellness, Health, and Physical Fitness",
      "Components/Dimensions of Wellness, Health, and Physical Fitness",
      "Traditional Sports & Regional Games for promoting wellness",
      "Leadership through Physical Activity and Sports",
      "Introduction to First Aid – PRICE"
    ],
    "Test, Measurements & Evaluation": [
      "Define Test, Measurements and Evaluation",
      "Importance of Test, Measurements and Evaluation in Sports",
      "Calculation of BMI, Waist-Hip Ratio, Skin fold measurement (3-site)",
      "Somato Types (Endomorphy, Mesomorphy & Ectomorphy)",
      "Measurements of health-related fitness – BMI computation"
    ],
    "Fundamentals of Anatomy and Physiology in Sports": [
      "Definition and importance of Anatomy and Physiology in Exercise and Sports",
      "Functions of Skeletal System, Classification of Bones, and Types of Joints",
      "Properties and Functions of Muscles",
      "Structure and Functions of Circulatory System and Heart",
      "Structure and Functions of Respiratory System"
    ],
    "Fundamentals of Kinesiology and Biomechanics in Sports": [
      "Definition and Importance of Kinesiology and Biomechanics in Sports",
      "Principles of Biomechanics",
      "Kinetics and Kinematics in Sports",
      "Types of Body Movements – Flexion, Extension, Abduction, Adduction, Rotation, Circumduction, Supination & Pronation",
      "Axis and Planes – Concept and its application in body movements"
    ],
    "Psychology and Sports": [
      "Definition & Importance of Psychology in Physical Education & Sports",
      "Developmental Characteristics at Different Stages of Development",
      "Adolescent Problems & their Management",
      "Team Cohesion and Sports",
      "Psychological Attributes: Attention, Resilience, Mental Toughness"
    ],
    "Training & Doping in Sports": [
      "Concept and Principles of Sports Training",
      "Training Load: Over Load, Adaptation, and Recovery",
      "Warming-up & Limbering Down – Types, Method & Importance",
      "Concept of Skill, Technique, Tactics & Strategies",
      "Concept of Doping and its disadvantages"
    ]
  },
  "12": {
    "Management of Sporting Events": [
      "Functions of Sports Events Management (Planning, Organising, Staffing, Directing & Controlling)",
      "Various Committees & their Responsibilities (pre, during & post)",
      "Fixtures and their Procedures – Knock-Out (Bye & Seeding) & League (Staircase, Cyclic, Tabular method) and Combination tournaments",
      "Intramural & Extramural tournaments – Meaning, Objectives & Its Significance",
      "Community sports program (Sports Day, Health Run, Run for Fun, Run for Specific Cause & Run for Unity)"
    ],
    "Children and Women in Sports": [
      "Exercise guidelines of WHO for different age groups",
      "Common postural deformities – knock knees, flat foot, round shoulders, Lordosis, Kyphosis, Scoliosis, bow legs and corrective measures",
      "Women's participation in Sports – Physical, Psychological, and social benefits",
      "Special consideration (menarche and menstrual dysfunction)",
      "Female athlete triad (osteoporosis, amenorrhea, eating disorders)"
    ],
    "Yoga as Preventive measure for Lifestyle Disease": [
      "Obesity – Asanas: Tadasana, Katichakrasana, Pavanmuktasana, Matsayasana, Halasana, Pachimottanasana, Ardha-Matsyendrasana, Dhanurasana, Ushtrasana, Suryabedhan pranayama",
      "Diabetes – Asanas: Katichakrasana, Pavanmuktasana, Bhujangasana, Shalabhasana, Dhanurasana, Suptavajarasana, Paschimottanasana, ArdhaMastendrasan, Mandukasana, Gomukasana, Yogmudra, Ushtrasana, Kapalabhati",
      "Asthma – Asanas: Tadasana, Urdhwahastottansana, UttanMandukasana, Bhujangasana, Dhanurasana, Ushtrasana, Vakrasana, Kapalbhati, Gomukhasana, Matsyaasana, Anuloma-Viloma",
      "Hypertension – Asanas: Tadasana, Katichakransan, Uttanpadasana, Ardha Halasana, Sarala Matyasana, Gomukhasana, UttanMandukasana, Vakrasana, Bhujangasana, Makarasana, Shavasana",
      "Back Pain and Arthritis – Asanas: Tadasana, Urdhawahastootansana, ArdhChakrasana, Ushtrasana, Vakrasana, Sarala Maysyendrsana, Bhujangasana, Gomukhasana, Bhadrasana, Makarasana, NadiShodhanapranayama"
    ],
    "Physical Education & Sports for (CWSN)": [
      "Organisations promoting Disability Sports (Special Olympics, Paralympics, Deaflympics)",
      "Concept of Classification and Divisioning in Sports",
      "Concept of Inclusion in sports, its need, and Implementation",
      "Advantages of Physical Activities for children with special needs",
      "Strategies to make Physical Activities accessible for children with special needs"
    ],
    "Sports & Nutrition": [
      "Concept of balanced diet and nutrition",
      "Macro and Micro Nutrients: Food sources & functions",
      "Nutritive & Non-Nutritive Components of Diet",
      "Eating for Weight control – A Healthy Weight, The Pitfalls of Dieting, Food Intolerance, and Food Myths",
      "Importance of Diet in Sports – Pre, During and Post competition Requirements"
    ],
    "Test and Measurement in Sports": [
      "Fitness Test – SAI Khelo India Fitness Test in school (Age group 5-8 years/class 1-3: BMI, Flamingo Balance Test, Plate Tapping Test; Age group 9-18yrs/class 4-12: BMI, 50mt Speed test, 600mt Run/Walk, Sit & Reach, Strength Test)",
      "Measurement of Cardio-Vascular Fitness – Harvard Step Test",
      "Computing Basal Metabolic Rate (BMR)",
      "Rikli & Jones – Senior Citizen Fitness Test (Chair Stand, Arm Curl, Chair Sit & Reach, Back Scratch, Eight Foot Up & Go, Six-Minute Walk Test)",
      "Johnsen-Methney Test of Motor Educability (Front Roll, Back Roll, Jumping Half-Turn, Jumping full-turn)"
    ],
    "Physiology & Injuries in Sport": [
      "Physiological factors determining components of physical fitness",
      "Effect of exercise on the Muscular System",
      "Effect of exercise on the Cardio-Respiratory System",
      "Physiological changes due to aging",
      "Sports injuries: Classification – Soft Tissue Injuries (Abrasion, Contusion, Laceration, Incision, Sprain & Strain), Bone & Joint Injuries (Dislocation, Fractures – Green Stick, Comminuted, Transverse, Oblique & Impacted)"
    ],
    "Biomechanics and Sports": [
      "Newton\'s Law of Motion & its application in sports",
      "Types of Levers and their application in Sports",
      "Equilibrium – Dynamic & Static and Centre of Gravity and its application in sports",
      "Friction & Sports",
      "Projectile in Sports"
    ],
    "Psychology and Sports": [
      "Personality; its definition & types (Jung Classification & Big Five Theory)",
      "Motivation, its type & techniques",
      "Exercise Adherence: Reasons, Benefits & Strategies for Enhancing it",
      "Meaning, Concept & Types of Aggressions in Sports",
      "Psychological Attributes in Sports – Self-Esteem, Mental Imagery, Self-Talk, Goal Setting"
    ],
    "Training in Sports": [
      "Concept of Talent Identification and Talent Development in Sports",
      "Introduction to Sports Training Cycle – Micro, Meso, Macro Cycle",
      "Types & Methods to Develop – Strength, Endurance, and Speed",
      "Types & Methods to Develop – Flexibility and Coordinative Ability",
      "Circuit Training – Introduction & its importance"
    ]
  }
};

export const generateMindMap = async (grade: string, chapter: string, board: BoardType) => {
  // Get exact topics from official CBSE 2025-26 curriculum
  const gradeKey = grade === "11" ? "11" : "12";
  const exactTopics = CBSE_CURRICULUM[gradeKey]?.[chapter] || [];
  const topicsContext = exactTopics.length > 0
    ? `EXACT TOPICS from CBSE 2025-26 official curriculum for this chapter:\n${exactTopics.map((t, i) => `${i+1}. ${t}`).join("\n")}`
    : `Chapter: ${chapter}`;

  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Generate detailed mind map for CBSE Class ${grade} PE Chapter: "${chapter}".\n\n${topicsContext}`,
    config: {
      systemInstruction: `You are a CBSE Physical Education expert. Return JSON: { center: string, branches: [{ title, description, subTopics?: string[] }] }
CRITICAL: Use EXACTLY the topics listed above — these are from the official CBSE 2025-26 curriculum PDF.
Each topic from the list must become one branch. Add 2-4 specific subTopics per branch based on that topic.
Do NOT invent topics not in the curriculum. Be accurate and exam-focused.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

// ── Theory Content ───────────────────────────────────────────────────────────
export const generateTheoryContent = async (
  grade: string, topic: string, board: BoardType, contentType: string, language: Language
): Promise<TheoryContent> => {
  // Get exact curriculum context for this topic
  const gradeKey = grade === "11" ? "11" : "12";
  let exactContext = "";
  
  const isFullChapter = topic.startsWith("Full Chapter: ");
  const cleanTopic = isFullChapter ? topic.replace("Full Chapter: ", "").trim() : topic;
  const lowerTopic = cleanTopic.toLowerCase();

  // 1. Try EXACT Chapter Match first
  for (const chapter of Object.keys(CBSE_CURRICULUM[gradeKey] || {})) {
    if (chapter.toLowerCase() === lowerTopic) {
      exactContext = `This is a request for the full chapter: "${chapter}".\nGenerate comprehensive content covering ALL these exact curriculum topics: ${CBSE_CURRICULUM[gradeKey][chapter].join("; ")}`;
      break;
    }
  }

  // 2. Try partial match if not found
  if (!exactContext) {
    for (const [chapter, topics] of Object.entries(CBSE_CURRICULUM[gradeKey] || {})) {
      const chapterLower = chapter.toLowerCase();
      
      // Check if topic is a specific sub-topic in this chapter
      const matchedTopic = (topics as string[]).find(t => {
        const tLower = t.toLowerCase();
        return tLower === lowerTopic || tLower.includes(lowerTopic);
      });

      if (matchedTopic) {
        exactContext = `This specific topic is "${matchedTopic}" from Chapter: "${chapter}".\nEnsure content is strictly as per NCERT Class ${grade} textbook for this section.`;
        break;
      }

      // Check if topic is part of chapter name (but avoid generic "Sports" collision)
      if (lowerTopic.length > 5 && chapterLower.includes(lowerTopic)) {
        exactContext = `This pertains to Chapter: "${chapter}".\nGenerate content based on these exact curriculum topics: ${(topics as string[]).join("; ")}`;
        break;
      }
    }
  }

  const response = await callAIBase({
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

// ── Lesson Diagram — using image.pollinations.ai ───────────────────────────
export const generateLessonDiagram = async (prompt: string, _context = "general") => {
  if (!prompt) return undefined;
  
  // Clean and shorten the prompt for better stability
  const cleanPrompt = prompt.toString().replace(/[^\w\s,]/gi, '').substring(0, 500);
  const educationalPrompt = `${cleanPrompt}, educational physics diagram, sports biomechanics, professional illustration, scientific style`;
  
  // Using image.pollinations.ai for more direct image generation
  const encodedPrompt = encodeURIComponent(educationalPrompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
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

// ── Test Question Paper Generator ──────────────────────────────────────────
export const generateQuestionPaper = async (
  grade: string, 
  chapters: string[], 
  testType: string, 
  language: Language = 'English'
) => {
  const isClass12 = grade === '12';
  const isFullPaper = testType.toLowerCase().includes('term') || testType.toLowerCase().includes('preboard');
  const maxMarks = isFullPaper ? 70 : 35;
  const timeAllowed = isFullPaper ? '3 Hours' : '90 Minutes';

  const response = await callAIBase({
    model: "claude-sonnet",
    contents: `Generate a CBSE ${grade} PE ${testType} for these chapters: ${chapters.join(', ')}. Language: ${language}.`,
    config: {
      systemInstruction: `You are an expert CBSE Physical Education Teacher (NCERT 2025-26). 
Generate a ${maxMarks}-mark question paper in JSON format: { title, grade, testType, timeAllowed, maxMarks, generalInstructions: [], sections: [...] }.

GENERAL INSTRUCTIONS FOR ALL PAPERS:
1. The question paper consists of 15 questions (for 35m) or 37 questions (for 70m).
2. All questions are compulsory.

STRUCTURE FOR 35 MARKS (15 Questions Total):
- generalInstructions: [
    "The question paper consists of 15 questions.",
    "All questions are compulsory.",
    "Question 1 – 6 carry 1 mark.",
    "Question 7 and 8 carry 2 marks each and should not exceed 30 – 50 words.",
    "Question 9 - 13 carry 3 marks each and should not exceed 100 – 150 words.",
    "Question 14 – 15 carry 5 marks each and should not exceed 180 - 220 words."
  ]
- Section A: Q1-Q6 (6 MCQs, 1m each).
- Section B: Q7-Q8 (2 Short Answer, 2m each, 30-50 words).
- Section C: Q9-Q13 (5 Short Answer, 3m each, 100-150 words). IMPORTANT: Q13 MUST be a Case Study with 3 sub-questions (i, ii, iii).
- Section D: Q14-Q15 (2 Long Answer, 5m each, 180-220 words). Provide internal choice (OR) for both.

STRUCTURE FOR 70 MARKS (Standard CBSE Board Pattern - 37 Questions):
- Section A: Q1-Q18 (18 MCQs, 1m each)
- Section B: Q19-Q24 (6 Very Short, 2m each, 60-90 words). Provide internal choice (OR) for one question or instruction to "Attempt any 5".
- Section C: Q25-Q30 (6 Short, 3m each, 100-150 words). Provide internal choice (OR) for one question or instruction to "Attempt any 5".
- Section D: Q31-Q33 (3 Case Studies, 4m each)
- Section E: Q34-Q37 (4 Long Answer, 5m each, 200-300 words). Provide internal choice (OR) or instruction to "Attempt any 3".

CONTENT RULES:
- Use STRICT NCERT Class ${grade} textbook content.
- Sections must include headers like "Section A", "Section B" etc.
- Support Internal Choices (OR) for 5-mark questions by putting "OR" in the question text or as a separate question object if needed (but prefer keeping total question count).
- Return EXACT JSON structure.`,
      responseMimeType: "application/json",
    },
  });
  return safeParseJson(response.text);
};

