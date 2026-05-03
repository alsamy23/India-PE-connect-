
import { BoardType, LessonPlan, YearlyPlan, TheoryContent, Language, FitnessAssessment, BiomechanicsConcept, TestPaper } from "../types.ts";

const callAIBase = async (payload: any, retries = 2) => {
  // Check for internet connection first
  if (!navigator.onLine) {
    throw new Error("No Internet Connection: Please check your network settings and try again.");
  }

  // Map legacy names to current best models
  if (payload.model === 'gemini-flash-latest') {
    payload.model = 'gemini-1.5-flash'; 
  }
  
  // Add ThinkingLevel.LOW to config to minimize latency for speed (ONLY for Gemini models that support it)
  if (!payload.config) payload.config = {};
  const supportsThinking = payload.model && payload.model.includes("gemini-2.0");
  
  if (supportsThinking && !payload.config.thinkingConfig) {
    payload.config.thinkingConfig = { thinkingLevel: 'LOW' };
  } else if (!supportsThinking && payload.config.thinkingConfig) {
    delete payload.config.thinkingConfig;
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
      
      // Handle Quota Exceeded (429)
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
          console.warn("AI Key expired or invalid. Prompting for key selection.");
          try {
            await window.aistudio.openSelectKey();
            // Await the retry so that if it fails, it rejects HERE rather than floating
            return await callAIBase(payload, 0);
          } catch (keySelectError: any) {
            console.error("Key selection failed or was cancelled:", keySelectError);
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
    if (!text) {
      throw new Error("Empty response from server.");
    }
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned invalid JSON response: ${text.substring(0, 100)}`);
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

const safeParseJson = (data: any): any => {
  if (!data) throw new Error("AI response was empty.");
  
  // If it's already an object, return it (sometimes the proxy parses it)
  if (typeof data === 'object') return data;
  
  // If it's a string, try to parse it
  if (typeof data === 'string') {
    let cleanText = data.replace(/```json/g, '').replace(/```/g, '').trim();

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
  }

  return data;
};

export const generateLessonPlan = async (
  board: BoardType,
  grade: string,
  sport: string,
  topic: string,
  teacherName: string,
  duration: string,
  date: string,
  language: Language,
  equipment: string
): Promise<LessonPlan> => {
  const schema = {
    // ... schema remains same ...
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
    model: 'gemini-1.5-flash',
    contents: `Detailed PE Lesson Plan. Board: ${board}, Grade: ${grade}, Sport: ${sport}, Topic: ${topic}, Lang: ${language}, Duration: ${duration}, Available Equipment: ${equipment || 'Standard PE equipment'}.`,
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
      7. Equipment: List all necessary items. You MUST design the lesson plan around the available equipment provided by the user. If no specific equipment is provided, use standard PE equipment.
      8. Teaching Aids: Whistles, cones, charts, etc.
      9. Key Vocabulary: Terms students should learn.
      Translate all content to ${language}. Ensure NO fields are empty strings. Use the provided duration (${duration}) to time the activities correctly.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  // Handle both { text: "..." } and direct object responses
  const aiText = response.text || (typeof response === 'string' ? response : null);
  if (aiText) return safeParseJson(aiText);
  
  // If it's already an object but not in .text (some proxies)
  if (typeof response === 'object' && !Array.isArray(response) && Object.keys(response).length > 2) {
    return response;
  }
  
  throw new Error("AI returned an unexpected response format.");
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
    model: 'gemini-1.5-flash',
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

  const parsed = safeParseJson(response.text || response);
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
    model: 'gemini-1.5-flash',
    contents: `Generate a comprehensive mind map structure for CBSE Class ${grade} Physical Education Chapter: ${chapter}. 
    Include ALL major topics and sub-topics from the latest 2025-2026 CBSE curriculum and NCERT textbook.
    Provide 6-8 main branches with clear, academic titles and brief descriptions.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: "You are a CBSE Physical Education Subject Matter Expert. Generate a structured, hierarchical mind map in JSON format. Ensure full coverage of the specified chapter according to the 2025-2026 syllabus.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text || response);
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
    model: 'gemini-1.5-flash',
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
  return safeParseJson(response.text || response);
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
    model: 'gemini-1.5-flash',
    contents: `PE Tool ${toolId}. Parameters: ${JSON.stringify(params)}.`,
    config: { 
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: "You are a PE Expert. Be decisive and do not ask for clarification. Generate high-quality, actionable content. Do not return empty fields. If specific data is missing, generate realistic examples.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text || response);
};

export const generateLessonDiagram = async (prompt: string, context: string = 'general') => {
  if (!prompt || prompt.length < 5) return undefined;
  try {
    const response = await callAIBase({
      model: 'gemini-1.5-flash',
      contents: { parts: [{ text: `Minimalist sports coaching diagram description. Whiteboard style. No text. ${context}: ${prompt}` }] }
    });
    // This model returns text, not images. We would need a separate image generation tool.
    // For now, we'll return undefined to avoid errors or just use a placeholder if needed.
    // But since the original code expected inlineData, we'll leave it as is but safer.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
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
    model: 'gemini-1.5-flash',
    contents: `Skill progression: ${sport} - ${skill}`,
    config: { 
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: "Be decisive and do not ask for clarification. Generate a detailed 3-4 phase skill progression. Ensure diagrams prompts are descriptive. Drills must be actionable.",
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text || response);
};

export const getStateRegulationInsights = async (state: string, board: BoardType) => {
  const response = await callAIBase({
    model: 'gemini-1.5-flash',
    contents: `PE regulations for ${state} ${board}. Marks, Hours, Curriculum.`,
    config: { thinkingConfig: { thinkingLevel: "LOW" } }
  });
  return response.text;
};

export const evaluateFitnessTests = async (
  age: string,
  gender: string,
  category: string,
  testName: string,
  value: string
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
    model: 'gemini-1.5-flash',
    contents: `Assess fitness test result. 
    Category: ${category}.
    Test: ${testName}.
    Result: ${value}.
    Student: Age ${age}, ${gender}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are a professional Sports Scientist and Fitness Assessor. 
      Be decisive and do not ask for clarification.
      Task: Compare the provided test result to international standard norms (e.g. ACSM, NSCA).
      Output JSON must be fully populated.
      Calculate percentile and rating strictly based on standard age/gender norms.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text || response);
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
    model: 'gemini-1.5-flash',
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
  return safeParseJson(response.text || response);
};

export const generateTestPaper = async (
  grade: string,
  topic: string,
  testType: string,
  timeAllowed: string,
  maxMarks: number,
  language: Language
): Promise<TestPaper> => {
  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      grade: { type: "STRING" },
      displayGrade: { type: "STRING" },
      subjectCode: { type: "STRING" },
      sessionLabel: { type: "STRING" },
      testType: { type: "STRING" },
      timeAllowed: { type: "STRING" },
      maxMarks: { type: "NUMBER" },
      generalInstructions: { type: "ARRAY", items: { type: "STRING" } },
      sections: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            sectionId: { type: "STRING" },
            heading: { type: "STRING" },
            instructions: { type: "STRING" },
            questions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  questionNumber: { type: "NUMBER" },
                  question: { type: "STRING" },
                  marks: { type: "NUMBER" },
                  options: { type: "ARRAY", items: { type: "STRING" } },
                  answer: { type: "STRING" },
                  caseStudyText: { type: "STRING" },
                  subQuestions: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        question: { type: "STRING" },
                        options: { type: "ARRAY", items: { type: "STRING" } },
                        answer: { type: "STRING" }
                      }
                    }
                  }
                },
                required: ["question", "marks"]
              }
            }
          },
          required: ["sectionId", "instructions", "questions"]
        }
      },
      markingScheme: {
        type: "OBJECT",
        properties: {
          header: { type: "STRING" },
          sections: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                sectionId: { type: "STRING" },
                items: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      qNo: { type: "STRING" },
                      answer: { type: "STRING" },
                      marks: { type: "STRING" }
                    },
                    required: ["qNo", "answer", "marks"]
                  }
                }
              },
              required: ["sectionId", "items"]
            }
          }
        },
        required: ["header", "sections"]
      }
    },
    required: ["title", "grade", "maxMarks", "sections", "generalInstructions", "markingScheme"]
  };

  const isCBSE12 = (grade === '12' || grade === 'Class 12') && (topic.toLowerCase().includes('cbse') || true); // Assuming CBSE if 70 marks or grade 12 for this context

  const response = await callAIBase({
    model: 'gemini-1.5-flash',
    contents: `Generate a Physical Education Question Paper (CBSE). 
    Grade: ${grade}, Topic: ${topic}, 
    Type: ${testType}, Time: ${timeAllowed}, Marks: ${maxMarks}, 
    Language: ${language}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      maxOutputTokens: 8192,
      systemInstruction: `You are an expert CBSE Physical Education Examiner. 
      Be decisive and do not ask for clarification.
      Create a professional question paper following standard CBSE 2025-26 educational patterns for Code 048.
      
      ${isCBSE12 && maxMarks === 70 ? `
      STRICT STRUCTURE FOR 70 MARKS (CBSE CLASS 12 PHYSICAL EDUCATION - 048):
      1. Section A: Q1-Q18 (18 Questions) - 1 mark each, MCQs. All compulsory.
      2. Section B: Q19-Q24 (6 Questions) - 2 marks each, Very Short Answer (60-90 words). Students must attempt any 5.
      3. Section C: Q25-Q30 (6 Questions) - 3 marks each, Short Answer (100-150 words). Students must attempt any 5.
      4. Section D: Q31-Q33 (3 Questions) - 4 marks each. Each question is a CASE STUDY. 
         FORMAT FOR SECTION D: Provide a descriptive scenario or observation text in 'caseStudyText'. Then provide exactly 4 MCQs in the 'subQuestions' array. Each MCQ sub-question is worth 1 mark (Total 4 per case study).
      5. Section E: Q34-Q37 (4 Questions) - 5 marks each, Long Answer (200-300 words). Students must attempt any 3.
      Total Marks MUST equal exactly 70.
      
      MARKING SCHEME:
      You MUST generate a COMPLETE 'markingScheme' for EVERY SINGLE QUESTION from Q1 to Q37. 
      - For Section A & D MCQs: Provide the correct option (A, B, C or D) and the explanation/text.
      - For Section B, C, and E: Provide exhaustive point-wise answers and a clear marking breakdown.
      Do NOT omit any questions. The marking scheme must be 100% complete.
      ` : `
      Distribute marks to total exactly ${maxMarks} using sections A, B, C, D, and E as appropriate.
      `}
      
      Ensure questions are high-quality, relevant to the CBSE 2025-26 syllabus (NCERT based), and cover the topic: ${topic}.
      Language: ${language}.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text || response);
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
    model: 'gemini-1.5-flash',
    contents: `Explain biomechanics concept '${concept}' in '${sport}'. Language: ${language}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `Output JSON. Be decisive and do not ask for clarification. Explanation must be simple for school students. Include a visual analogy description. Language: ${language}.`,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });
  return safeParseJson(response.text || response);
};

export const getSportsRule = async (sport: string, query: string, language: Language) => {
  const response = await callAIBase({
    model: 'gemini-1.5-flash',
    contents: `Rule Check: ${sport}. Question: ${query}. Language: ${language}`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are an expert official for global and Indian Sports (Kabaddi, Kho-Kho, Cricket, Football, Basketball, Tennis, Badminton, Athletics, Hockey, etc.). Be decisive and do not ask for clarification. Provide specific rule numbers if possible. Keep it concise. Language: ${language}.`,
    }
  });
  return response.text;
};

export const generateParentLetter = async (
  studentName: string,
  teacherName: string,
  purpose: string,
  details: string,
  language: Language
): Promise<string> => {
  const response = await callAIBase({
    model: 'gemini-1.5-flash',
    contents: `Generate a professional parent letter. 
    Student: ${studentName}, Teacher: ${teacherName}, 
    Purpose: ${purpose}, Details: ${details}, 
    Language: ${language}.`,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: `You are a professional Physical Education Teacher and School Administrator. 
      Write a formal, polite, and professional letter to a parent. 
      The letter should follow a standard school communication format:
      - Date
      - Salutation (Dear Parent/Guardian of [Student Name])
      - Clear subject line
      - Body text clearly explaining the purpose: ${purpose}
      - Include specific details if provided: ${details}
      - Professional closing (Sincerely, [Teacher Name])
      Language: ${language}. 
      Ensure the tone is supportive and professional.`,
    }
  });
  return response.text;
};
