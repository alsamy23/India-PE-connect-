
import { BoardType, LessonPlan, YearlyPlan, TheoryContent, Language, FitnessAssessment, BiomechanicsConcept } from "../types.ts";

const callAIBase = async (payload: any, retries = 2) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // Increased to 90s for complex plans

  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // ... existing error handling ...
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
      
      // Handle Quota Exceeded (429)
      const isQuotaError = response.status === 429 || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
      if (isQuotaError) {
        throw new Error("AI Quota Exceeded: You've reached the daily limit for the free version of Gemini. Please try again in a few hours or use a different API key with a paid project.");
      }

      const isInvalidKeyError = response.status === 401 || response.status === 400 || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not valid");
      if (isInvalidKeyError) {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          return callAIBase(payload, 0);
        }
      }

      if (retries > 0 && response.status >= 500) {
        return callAIBase(payload, retries - 1);
      }
      throw new Error(errorMessage);
    }
    
    const text = await response.text();
    if (!text) {
      console.error("Empty response body from /api/ai/generate");
      throw new Error("Empty response from server.");
    }
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error on Response:", text);
      throw new Error(`Server returned invalid JSON response: ${text.substring(0, 100)}`);
    }

    if (!parsed.text && parsed.candidates) {
      console.warn("Response has candidates but no text property.", parsed);
    }

    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error("The AI took too long to respond (Timeout). Please try a simpler request or check your internet connection.");
    }

    if (retries > 0) {
      return callAIBase(payload, retries - 1);
    }
    throw error;
  }
};

const safeParseJson = (text: string | undefined): any => {
  if (!text) throw new Error("AI response was empty.");
  
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("The AI response was malformed. Please try again.");
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (innerE) {
      throw new Error("The AI generated an invalid format. Try simplifying your request.");
    }
  }
};

export const generateLessonPlan = async (
  board: BoardType,
  grade: string,
  sport: string,
  topic: string,
  teacherName: string,
  duration: string,
  date: string,
  language: Language
): Promise<LessonPlan> => {
  const schema = {
    type: "OBJECT",
    properties: {
      teacher: { type: "STRING" },
      subject: { type: "STRING" },
      grade: { type: "STRING" },
      date: { type: "STRING" },
      topic: { type: "STRING" },
      period: { type: "STRING" },
      termWeek: { type: "STRING" },
      duration: { type: "STRING" },
      equipment: { type: "ARRAY", items: { type: "STRING" } },
      teachingAids: { type: "ARRAY", items: { type: "STRING" } },
      safety: { type: "ARRAY", items: { type: "STRING" } },
      keyVocabulary: { type: "ARRAY", items: { type: "STRING" } },
      sen: {
        type: "OBJECT",
        properties: {
          wave1: { type: "STRING" },
          wave2: { type: "STRING" },
          wave3: { type: "STRING" }
        }
      },
      objectives: {
        type: "OBJECT",
        properties: {
          know: { type: "STRING" },
          understand: { type: "STRING" },
          beAbleTo: { type: "STRING" }
        }
      },
      successCriteria: {
        type: "OBJECT",
        properties: {
          all: { type: "STRING" },
          most: { type: "STRING" },
          some: { type: "STRING" }
        }
      },
      starter: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING" },
          title: { type: "STRING" },
          description: { type: "STRING" }
        }
      },
      mainActivity: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING" },
          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                coachingPoints: { type: "ARRAY", items: { type: "STRING" } }
              }
            }
          }
        }
      },
      plenary: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING" },
          title: { type: "STRING" },
          description: { type: "STRING" }
        }
      },
      homework: { type: "STRING" },
      collaboration: { type: "STRING" },
      differentiation: { type: "STRING" },
      criticalThinking: { type: "STRING" },
      warmupDiagramPrompt: { type: "STRING" },
      explanationDiagramPrompt: { type: "STRING" },
      gameDiagramPrompt: { type: "STRING" }
    },
    required: ["objectives", "starter", "mainActivity", "plenary", "warmupDiagramPrompt", "explanationDiagramPrompt"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Detailed PE Lesson Plan. Board: ${board}, Grade: ${grade}, Sport: ${sport}, Topic: ${topic}, Lang: ${language}, Duration: ${duration}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are an expert Physical Education Curriculum Designer and Teacher's Assistant. 
      Be decisive and do not ask for clarification.
      Create a highly professional, structured PE lesson plan for a ${duration} session. 
      Format:
      1. Objectives: Clear Psychomotor (Know), Cognitive (Understand), and Affective (Apply) goals.
      2. Success Criteria: Differentiated (All, Most, Some).
      3. Starter: Engaging warm-up related to the topic (${duration} appropriate).
      4. Main Activity: 3 progressive drills with clear coaching points.
      5. Plenary: Cool-down and reflective questions.
      6. Safety: Specific risks for this sport/activity.
      7. Equipment: List all necessary items.
      8. Teaching Aids: Whistles, cones, charts, etc.
      9. Key Vocabulary: Terms students should learn.
      Translate all content to ${language}. Ensure NO fields are empty strings. Use the provided duration (${duration}) to time the activities correctly.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

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
  const safeCalendarText = calendarText ? calendarText.substring(0, 1500) : "No calendar.";
  
  const schema = {
    type: "OBJECT",
    properties: {
      grade: { type: "STRING" },
      board: { type: "STRING" },
      academicYear: { type: "STRING" },
      terms: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            termName: { type: "STRING" },
            months: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  monthName: { type: "STRING" },
                  weeks: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        weekNumber: { type: "NUMBER" },
                        status: { type: "STRING", enum: ['Instructional', 'Holiday', 'Exam', 'Event'] },
                        dates: { type: "STRING" },
                        topic: { type: "STRING" },
                        details: { type: "STRING" }
                      },
                      required: ["weekNumber", "status", "topic", "details"]
                    }
                  }
                },
                required: ["monthName", "weeks"]
              }
            }
          },
          required: ["termName", "months"]
        }
      }
    },
    required: ["terms", "academicYear"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Yearly PE Plan. Grade: ${grade}, Board: ${board}, Lang: ${language}. Start: ${startDate}. Terms: 2. Focus1: ${term1Focus}. Focus2: ${term2Focus}. Holidays: ${safeCalendarText}`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `Generate strictly valid JSON. 
      Be decisive and do not ask for clarification.
      Output Language: ${language} (translate Topic and Details).
      Structure: terms[] -> months[] -> weeks[].
      Constraint: 2 terms, Concise (max 5 words per detail).
      ENSURE DATA IS POPULATED. Do not return empty arrays.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const parsed = safeParseJson(response.text);
  const terms = Array.isArray(parsed.terms) ? parsed.terms : [];

  return { 
    ...parsed, 
    grade: parsed.grade || grade, 
    board: parsed.board || board,
    duration: duration,
    terms: terms,
    generatedDate: new Date().toLocaleDateString(),
    academicYear: parsed.academicYear || "2024-2025"
  };
};

export const generateMindMap = async (grade: string, chapter: string, board: BoardType): Promise<{
  center: string;
  branches: {
    title: string;
    description: string;
    subTopics?: string[];
  }[];
}> => {
  const schema = {
    type: "OBJECT",
    properties: {
      center: { type: "STRING" },
      branches: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            subTopics: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["title", "description"]
        }
      }
    },
    required: ["center", "branches"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Generate a comprehensive mind map structure for CBSE Class ${grade} Physical Education Chapter: ${chapter}. 
    Include ALL major topics and sub-topics from the latest 2025-2026 CBSE curriculum and NCERT textbook.
    Provide 6-8 main branches with clear, academic titles and brief descriptions.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: "You are a CBSE Physical Education Subject Matter Expert. Generate a structured, hierarchical mind map in JSON format. Ensure full coverage of the specified chapter according to the 2025-26 syllabus.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const generateTheoryContent = async (grade: string, topic: string, board: BoardType, contentType: string, language: Language): Promise<TheoryContent> => {
  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      contentType: { type: "STRING" },
      content: { type: "STRING" },
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            answer: { type: "STRING" },
            type: { type: "STRING" }
          },
          required: ["question", "answer"]
        }
      }
    },
    required: ["title", "content", "questions"]
  };

  const isCBSE12 = board === 'CBSE' && (grade === '12' || grade === 'Class 12');
  const contextUrl = "https://www.failures.in/p/physical-education-class-12-notes-pdf.html";

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `PE Theory Content. Grade ${grade} ${board}. Topic: ${topic}. Type: ${contentType}. Language: ${language}.${isCBSE12 ? ` Use context from ${contextUrl}` : ''}`,
    config: { 
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are an expert CBSE PE Teacher. Output valid JSON. 
      Content Language: ${language}. 
      
      GUIDELINES:
      1. Reference: Strictly follow NCERT and CBSE 2025-26 curriculum.
      2. Style: For 'Notes', use the "shortest way for math-like understanding" - very logical, bulleted, and precise. Avoid fluff.
      3. Case Studies: For 'CaseStudy', follow the latest board sample paper patterns (2024-25/2025-26). Include a scenario followed by 3-4 analytical questions.
      4. MCQs: Ensure options are challenging and follow board patterns.
      
      ${isCBSE12 ? `IMPORTANT: Prioritize and summarize information from ${contextUrl} for this CBSE Class 12 request.` : ''}`,
      responseMimeType: "application/json",
      responseSchema: schema,
      tools: isCBSE12 ? [{ urlContext: {} }] : undefined
    }
  });
  return safeParseJson(response.text);
};

export const generateAIToolContent = async (toolId: string, params: any) => {
  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING", description: "Title of the generated resource" },
      content: { type: "STRING", description: "Main content, explanation or description" },
      items: { 
        type: "ARRAY", 
        items: { type: "STRING" },
        description: "List of key points, drill steps, or specific items"
      },
      summary: { type: "STRING", description: "Brief summary or conclusion" }
    },
    required: ["title", "content"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `PE Tool ${toolId}. Parameters: ${JSON.stringify(params)}.`,
    config: { 
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: "You are a PE Expert. Be decisive and do not ask for clarification. Generate high-quality, actionable content. Do not return empty fields. If specific data is missing, generate realistic examples.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const generateLessonDiagram = async (prompt: string, context: string = 'general') => {
  try {
    const response = await callAIBase({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Minimalist sports coaching diagram. Whiteboard style. No text. ${context}: ${prompt}` }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (err) { console.error("Diagram error", err); }
  return undefined;
};

export const generateSkillProgression = async (sport: string, skill: string) => {
  const schema = {
    type: "OBJECT",
    properties: {
      skillName: { type: "STRING" },
      level: { type: "STRING" },
      phases: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            phaseName: { type: "STRING" },
            drills: { type: "ARRAY", items: { type: "STRING" } },
            technicalFocus: { type: "STRING" },
            diagramPrompt: { type: "STRING" }
          },
          required: ["phaseName", "drills", "technicalFocus", "diagramPrompt"]
        }
      }
    },
    required: ["skillName", "phases"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Skill progression: ${sport} - ${skill}`,
    config: { 
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: "Be decisive and do not ask for clarification. Generate a detailed 3-4 phase skill progression. Ensure diagrams prompts are descriptive. Drills must be actionable.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const getStateRegulationInsights = async (state: string, board: BoardType) => {
  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `PE regulations for ${state} ${board}. Marks, Hours, Curriculum.`,
    config: { thinkingConfig: { thinkingLevel: "LOW" } }
  });
  return response.text;
};

export const evaluateKheloIndiaScores = async (
  age: string,
  gender: string,
  tests: { name: string; value: string }[]
): Promise<FitnessAssessment> => {
  const schema = {
    type: "OBJECT",
    properties: {
      studentName: { type: "STRING" },
      age: { type: "NUMBER" },
      gender: { type: "STRING" },
      overallSummary: { type: "STRING" },
      tests: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            testName: { type: "STRING" },
            score: { type: "STRING" },
            percentile: { type: "STRING" },
            rating: { type: "STRING", enum: ['Needs Improvement', 'Average', 'Good', 'Excellent', 'Elite'] },
            recommendation: { type: "STRING" },
          },
          required: ["testName", "score", "percentile", "rating", "recommendation"]
        }
      }
    },
    required: ["studentName", "age", "gender", "tests", "overallSummary"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Assess fitness based on Khelo India Norms. 
    Student: Age ${age}, ${gender}.
    Tests Provided: ${JSON.stringify(tests)}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are a Khelo India Assessor. 
      Be decisive and do not ask for clarification.
      Task: Compare scores to Indian National Fitness Protocols.
      CRITICAL: If test scores are missing or empty in the input, ESTIMATE typical scores for a student of this age/gender who is 'Average' and label them as (Estimated).
      Output JSON must be fully populated. Do not return empty strings for recommendations or ratings.
      Calculate percentiles strictly.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const explainBiomechanics = async (
  sport: string,
  concept: string,
  language: Language
): Promise<BiomechanicsConcept> => {
  const schema = {
    type: "OBJECT",
    properties: {
      concept: { type: "STRING" },
      sportApplication: { type: "STRING" },
      explanation: { type: "STRING" },
      analogy: { type: "STRING" },
      diagramPrompt: { type: "STRING" }
    },
    required: ["concept", "explanation", "analogy", "diagramPrompt"]
  };

  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Explain biomechanics concept '${concept}' in '${sport}'. Language: ${language}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `Output JSON. Be decisive and do not ask for clarification. Explanation must be simple for school students. Include a visual analogy description. Language: ${language}.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const getSportsRule = async (sport: string, query: string, language: Language) => {
  const response = await callAIBase({
    model: 'gemini-flash-latest',
    contents: `Rule Check: ${sport}. Question: ${query}. Language: ${language}`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are an expert official for Indian Sports (Kabaddi, Kho-Kho, Cricket, Football). Be decisive and do not ask for clarification. Provide specific rule numbers if possible. Keep it concise. Language: ${language}.`,
    }
  });
  return response.text;
};
