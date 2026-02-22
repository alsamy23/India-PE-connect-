
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BoardType, LessonPlan, YearlyPlan, TheoryContent, Language, FitnessAssessment, BiomechanicsConcept } from "../types.ts";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY or API_KEY to your environment.");
  }
  return new GoogleGenAI({ apiKey });
};

const safeParseJson = (text: string | undefined): any => {
  if (!text) throw new Error("AI response was empty.");
  
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Brute force repair for truncated arrays
      const openBrackets = (cleanText.match(/\[/g) || []).length;
      const closeBrackets = (cleanText.match(/\]/g) || []).length;
      const openBraces = (cleanText.match(/\{/g) || []).length;
      const closeBraces = (cleanText.match(/\}/g) || []).length;
      
      let repaired = cleanText;
      for(let i=0; i < (openBraces - closeBraces); i++) repaired += "}";
      for(let i=0; i < (openBrackets - closeBrackets); i++) repaired += "]";
      
      try { return JSON.parse(repaired); } catch(err) {}
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
  durationStr: string,
  dateStr: string,
  language: Language
): Promise<LessonPlan> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      teacher: { type: Type.STRING },
      subject: { type: Type.STRING },
      grade: { type: Type.STRING },
      date: { type: Type.STRING },
      topic: { type: Type.STRING },
      period: { type: Type.STRING },
      termWeek: { type: Type.STRING },
      duration: { type: Type.STRING },
      equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
      teachingAids: { type: Type.ARRAY, items: { type: Type.STRING } },
      safety: { type: Type.ARRAY, items: { type: Type.STRING } },
      keyVocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
      sen: {
        type: Type.OBJECT,
        properties: {
          wave1: { type: Type.STRING },
          wave2: { type: Type.STRING },
          wave3: { type: Type.STRING }
        }
      },
      objectives: {
        type: Type.OBJECT,
        properties: {
          know: { type: Type.STRING },
          understand: { type: Type.STRING },
          beAbleTo: { type: Type.STRING }
        }
      },
      successCriteria: {
        type: Type.OBJECT,
        properties: {
          all: { type: Type.STRING },
          most: { type: Type.STRING },
          some: { type: Type.STRING }
        }
      },
      starter: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      },
      mainActivity: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                coachingPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      },
      plenary: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      },
      homework: { type: Type.STRING },
      collaboration: { type: Type.STRING },
      differentiation: { type: Type.STRING },
      criticalThinking: { type: Type.STRING },
      warmupDiagramPrompt: { type: Type.STRING },
      explanationDiagramPrompt: { type: Type.STRING },
      gameDiagramPrompt: { type: Type.STRING }
    },
    required: ["objectives", "starter", "mainActivity", "plenary", "warmupDiagramPrompt", "explanationDiagramPrompt"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Detailed PE Lesson Plan. Board: ${board}, Grade: ${grade}, Sport: ${sport}, Topic: ${topic}, Lang: ${language}, Duration: ${duration}, Period: ${period}.`,
    config: {
      systemInstruction: `You are an expert Physical Education Curriculum Designer and Teacher's Assistant. 
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
  const ai = getAI();
  const safeCalendarText = calendarText ? calendarText.substring(0, 1500) : "No calendar.";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      grade: { type: Type.STRING },
      board: { type: Type.STRING },
      academicYear: { type: Type.STRING },
      terms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            termName: { type: Type.STRING },
            months: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  monthName: { type: Type.STRING },
                  weeks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        weekNumber: { type: Type.NUMBER },
                        status: { type: Type.STRING, enum: ['Instructional', 'Holiday', 'Exam', 'Event'] },
                        dates: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        details: { type: Type.STRING }
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

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Yearly PE Plan. Grade: ${grade}, Board: ${board}, Lang: ${language}. Start: ${startDate}. Terms: 2. Focus1: ${term1Focus}. Focus2: ${term2Focus}. Holidays: ${safeCalendarText}`,
    config: {
      systemInstruction: `Generate strictly valid JSON. 
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

export const generateTheoryContent = async (grade: string, topic: string, board: BoardType, contentType: string, language: Language): Promise<TheoryContent> => {
  const ai = getAI();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      contentType: { type: Type.STRING },
      content: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    },
    required: ["title", "content", "questions"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `PE Theory Content. Grade ${grade} ${board}. Topic: ${topic}. Type: ${contentType}. Language: ${language}.`,
    config: { 
      systemInstruction: `Output valid JSON. Content Language: ${language}. Ensure content is detailed and questions are relevant.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const generateAIToolContent = async (toolId: string, params: any) => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the generated resource" },
      content: { type: Type.STRING, description: "Main content, explanation or description" },
      items: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of key points, drill steps, or specific items"
      },
      summary: { type: Type.STRING, description: "Brief summary or conclusion" }
    },
    required: ["title", "content"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `PE Tool ${toolId}. Parameters: ${JSON.stringify(params)}.`,
    config: { 
      systemInstruction: "You are a PE Expert. Generate high-quality, actionable content. Do not return empty fields. If specific data is missing, generate realistic examples.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const generateLessonDiagram = async (prompt: string, context: string = 'general') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
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
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      skillName: { type: Type.STRING },
      level: { type: Type.STRING },
      phases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phaseName: { type: Type.STRING },
            drills: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalFocus: { type: Type.STRING },
            diagramPrompt: { type: Type.STRING }
          },
          required: ["phaseName", "drills", "technicalFocus", "diagramPrompt"]
        }
      }
    },
    required: ["skillName", "phases"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Skill progression: ${sport} - ${skill}`,
    config: { 
      systemInstruction: "Generate a detailed 3-4 phase skill progression. Ensure diagrams prompts are descriptive. Drills must be actionable.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const getStateRegulationInsights = async (state: string, board: BoardType) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `PE regulations for ${state} ${board}. Marks, Hours, Curriculum.`,
  });
  return response.text;
};

// --- NEW FEATURES ---

export const evaluateKheloIndiaScores = async (
  age: string,
  gender: string,
  tests: { name: string; value: string }[]
): Promise<FitnessAssessment> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      studentName: { type: Type.STRING },
      age: { type: Type.NUMBER },
      gender: { type: Type.STRING },
      overallSummary: { type: Type.STRING },
      tests: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            testName: { type: Type.STRING },
            score: { type: Type.STRING },
            percentile: { type: Type.STRING },
            rating: { type: Type.STRING, enum: ['Needs Improvement', 'Average', 'Good', 'Excellent', 'Elite'] },
            recommendation: { type: Type.STRING },
          },
          required: ["testName", "score", "percentile", "rating", "recommendation"]
        }
      }
    },
    required: ["studentName", "age", "gender", "tests", "overallSummary"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Assess fitness based on Khelo India Norms. 
    Student: Age ${age}, ${gender}.
    Tests Provided: ${JSON.stringify(tests)}.`,
    config: {
      systemInstruction: `You are a Khelo India Assessor. 
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
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      concept: { type: Type.STRING },
      sportApplication: { type: Type.STRING },
      explanation: { type: Type.STRING },
      analogy: { type: Type.STRING },
      diagramPrompt: { type: Type.STRING }
    },
    required: ["concept", "explanation", "analogy", "diagramPrompt"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Explain biomechanics concept '${concept}' in '${sport}'. Language: ${language}.`,
    config: {
      systemInstruction: `Output JSON. Explanation must be simple for school students. Include a visual analogy description. Language: ${language}.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text);
};

export const getSportsRule = async (sport: string, query: string, language: Language) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Rule Check: ${sport}. Question: ${query}. Language: ${language}`,
    config: {
      systemInstruction: `You are an expert official for Indian Sports (Kabaddi, Kho-Kho, Cricket, Football). Provide specific rule numbers if possible. Keep it concise. Language: ${language}.`,
    }
  });
  return response.text;
};
