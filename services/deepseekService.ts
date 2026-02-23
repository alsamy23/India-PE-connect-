
import OpenAI from "openai";
import { BoardType, LessonPlan, YearlyPlan, TheoryContent, Language, FitnessAssessment, BiomechanicsConcept } from "../types.ts";

const getDeepseekClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY || import.meta.env.VITE_DEEPSEEK_API_KEY || "sk-c3acef363cba436a980889127b10b316";
  if (!apiKey) {
    throw new Error("Deepseek API key is not configured. Please add DEEPSEEK_API_KEY to your environment.");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
    dangerouslyAllowBrowser: true
  });
};

const safeParseJson = (text: string | null): any => {
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
  const client = getDeepseekClient();
  
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are an expert Physical Education Curriculum Designer. 
        Create a highly professional, structured PE lesson plan for a ${duration} session.
        Translate all content to ${language}.
        Output MUST be in valid JSON format matching the LessonPlan interface.`
      },
      {
        role: "user",
        content: `Detailed PE Lesson Plan. Board: ${board}, Grade: ${grade}, Sport: ${sport}, Topic: ${topic}, Lang: ${language}, Duration: ${duration}.`
      }
    ],
    response_format: { type: 'json_object' }
  });

  return safeParseJson(response.choices[0].message.content);
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
  const client = getDeepseekClient();
  
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are an expert PE Curriculum Designer. Generate a yearly plan in JSON format.
        Output Language: ${language}.
        Constraint: 2 terms, Concise (max 5 words per detail).`
      },
      {
        role: "user",
        content: `Yearly PE Plan. Grade: ${grade}, Board: ${board}, Lang: ${language}. Start: ${startDate}. Terms: 2. Focus1: ${term1Focus}. Focus2: ${term2Focus}. Holidays: ${calendarText}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const parsed = safeParseJson(response.choices[0].message.content);
  return { 
    ...parsed, 
    grade: parsed.grade || grade, 
    board: parsed.board || board,
    duration: duration,
    generatedDate: new Date().toLocaleDateString(),
    academicYear: parsed.academicYear || "2024-2025"
  };
};

export const generateTheoryContent = async (grade: string, topic: string, board: BoardType, contentType: string, language: Language): Promise<TheoryContent> => {
  const client = getDeepseekClient();

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `Output valid JSON for PE Theory Content. Content Language: ${language}.`
      },
      {
        role: "user",
        content: `PE Theory Content. Grade ${grade} ${board}. Topic: ${topic}. Type: ${contentType}. Language: ${language}.`
      }
    ],
    response_format: { type: 'json_object' }
  });
  return safeParseJson(response.choices[0].message.content);
};

export const evaluateKheloIndiaScores = async (
  age: string,
  gender: string,
  tests: { name: string; value: string }[]
): Promise<FitnessAssessment> => {
  const client = getDeepseekClient();
  
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are a Khelo India Assessor. Compare scores to Indian National Fitness Protocols. Output JSON.`
      },
      {
        role: "user",
        content: `Assess fitness based on Khelo India Norms. Student: Age ${age}, ${gender}. Tests Provided: ${JSON.stringify(tests)}.`
      }
    ],
    response_format: { type: 'json_object' }
  });
  return safeParseJson(response.choices[0].message.content);
};

export const explainBiomechanics = async (
  sport: string,
  concept: string,
  language: Language
): Promise<BiomechanicsConcept> => {
  const client = getDeepseekClient();
  
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `Output JSON explaining biomechanics concept. Language: ${language}.`
      },
      {
        role: "user",
        content: `Explain biomechanics concept '${concept}' in '${sport}'. Language: ${language}.`
      }
    ],
    response_format: { type: 'json_object' }
  });
  return safeParseJson(response.choices[0].message.content);
};

export const getSportsRule = async (sport: string, query: string, language: Language) => {
  const client = getDeepseekClient();
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `You are an expert official for Indian Sports. Keep it concise. Language: ${language}.`
      },
      {
        role: "user",
        content: `Rule Check: ${sport}. Question: ${query}. Language: ${language}`
      }
    ]
  });
  return response.choices[0].message.content;
};
