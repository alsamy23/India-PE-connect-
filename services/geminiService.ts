
import { GoogleGenAI, Type } from "@google/genai";
import { BoardType, LessonPlan } from "../types";

// Always use { apiKey: process.env.API_KEY } directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLessonPlan = async (
  board: BoardType,
  grade: string,
  sport: string,
  topic: string
): Promise<LessonPlan> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create an elite Physical Education lesson plan for ${board} Grade ${grade}, focusing on ${sport}: ${topic}. 
               
               TIMING & VISUAL REQUIREMENTS:
               1. Warm-up (exactly 5 mins): Describe dynamic stretches. Provide a "warmupDiagramPrompt".
               2. Explanation (exactly 10 mins): Technical principles. Provide an "explanationDiagramPrompt".
               3. The Game: Full rules and setup for a specific game. Provide a "gameDiagramPrompt".
               4. Assessment Rubric: Skills grading (Beginner to Advanced).
               
               Structure as JSON. Ensure timing is strict.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          grade: { type: Type.STRING },
          sport: { type: Type.STRING },
          duration: { type: Type.STRING },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                coachingCues: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["time", "description", "equipment", "coachingCues"]
            }
          },
          suggestedGame: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              rules: { type: Type.ARRAY, items: { type: Type.STRING } },
              setup: { type: Type.STRING }
            },
            required: ["name", "rules", "setup"]
          },
          assessmentRubric: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criteria: { type: Type.STRING },
                beginner: { type: Type.STRING },
                intermediate: { type: Type.STRING },
                advanced: { type: Type.STRING }
              }
            }
          },
          warmupDiagramPrompt: { type: Type.STRING },
          explanationDiagramPrompt: { type: Type.STRING },
          gameDiagramPrompt: { type: Type.STRING }
        },
        required: ["title", "grade", "sport", "duration", "objectives", "activities", "suggestedGame", "warmupDiagramPrompt", "explanationDiagramPrompt", "gameDiagramPrompt"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text || '{}') as LessonPlan;
};

export const generateAIToolContent = async (toolId: string, params: any) => {
  let prompt = "";
  let schema: any = { type: Type.OBJECT, properties: {} };

  switch (toolId) {
    case 'unit-planner':
      prompt = `Create a ${params.board} aligned Unit Plan for Grade ${params.grade} focusing on ${params.sport} over ${params.duration} weeks. Include weekly breakdown.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          unitTitle: { type: Type.STRING },
          duration: { type: Type.STRING },
          weeklyBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                focus: { type: Type.STRING },
                keyLearning: { type: Type.STRING },
                suggestedDrills: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      };
      break;

    case 'worksheet-maker':
      prompt = `Create an educational worksheet for Grade ${params.grade} ${params.board} PE about ${params.topic}. Include MCQs and reflective questions.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sectionTitle: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      type: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            }
          }
        }
      };
      break;

    case 'adapted-pe':
      prompt = `Suggest modifications for ${params.activity} for students with ${params.disability} to ensure inclusion.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          modifications: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyConsiderations: { type: Type.STRING }
        }
      };
      break;

    case 'differentiator':
      prompt = `Provide 3 levels of challenge (Beginner, Intermediate, Advanced) for this PE activity: ${params.activity}.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          beginner: { type: Type.STRING },
          intermediate: { type: Type.STRING },
          advanced: { type: Type.STRING }
        }
      };
      break;

    case 'sports-science':
      prompt = `Create a hands-on lab activity for students to learn about ${params.concept} through physical movement. Suitable for Grade ${params.grade}.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          activityName: { type: Type.STRING },
          scienceConcept: { type: Type.STRING },
          procedure: { type: Type.ARRAY, items: { type: Type.STRING } },
          discussionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      };
      break;

    case 'rubric-maker':
      prompt = `Generate a 4-level assessment rubric for ${params.topic} for ${params.board} curriculum, Grade ${params.grade}.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                levels: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }
              }
            }
          }
        }
      };
      break;

    case 'game-generator':
      prompt = `Suggest 5 PE games for ${params.skill} for Grade ${params.grade}. Indian context.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          games: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                equipment: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      };
      break;

    case 'report-writer':
      prompt = `Write a feedback comment for student ${params.name}. Strengths: ${params.strengths}. Goal: ${params.improvements}.`;
      schema = { type: Type.OBJECT, properties: { comment: { type: Type.STRING } } };
      break;

    case 'round-robin':
      prompt = `Schedule for ${params.teams} teams on ${params.courts} courts.`;
      schema = {
        type: Type.OBJECT,
        properties: {
          rounds: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { round: { type: Type.INTEGER }, matches: { type: Type.ARRAY, items: { type: Type.STRING } } } }
          }
        }
      };
      break;

    default:
      prompt = `As a ConnectedPE expert, advise on: ${params.query}`;
      schema = { type: Type.OBJECT, properties: { response: { type: Type.STRING } } };
  }

  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });

  const res = await model;
  return JSON.parse(res.text || '{}');
};

export const generateLessonDiagram = async (prompt: string, context: string = 'general') => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Professional technical PE coaching diagram. ${context} view: ${prompt}. Minimalist whiteboard style, clear icons, no text labels.` }],
    },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return undefined;
};

export const generateSkillProgression = async (sport: string, skill: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Technical mastery path for ${sport}: ${skill}. 4 phases.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getStateRegulationInsights = async (state: string, board: BoardType) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Physical Education marks/grading and contact hours for ${state} ${board}. Summarize latest guidelines.`,
  });
  return response.text;
};
