
import * as gemini from "./geminiService.ts";
import * as deepseek from "./deepseekService.ts";
import { BoardType, Language } from "../types.ts";

export type AIProvider = 'gemini' | 'deepseek';

let currentProvider: AIProvider = (localStorage.getItem('ai_provider') as AIProvider) || 'gemini';

export const setAIProvider = (provider: AIProvider) => {
  currentProvider = provider;
  localStorage.setItem('ai_provider', provider);
};

export const getAIProvider = () => currentProvider;

export const generateLessonPlan = async (
  board: BoardType,
  grade: string,
  sport: string,
  topic: string,
  teacherName: string,
  duration: string,
  date: string,
  language: Language
) => {
  if (currentProvider === 'deepseek') {
    return deepseek.generateLessonPlan(board, grade, sport, topic, teacherName, duration, date, language);
  }
  return gemini.generateLessonPlan(board, grade, sport, topic, teacherName, duration, date, language);
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
) => {
  if (currentProvider === 'deepseek') {
    return deepseek.generateYearlyPlan(grade, board, frequency, calendarText, term1Focus, term2Focus, startDate, duration, language);
  }
  return gemini.generateYearlyPlan(grade, board, frequency, calendarText, term1Focus, term2Focus, startDate, duration, language);
};

export const generateTheoryContent = async (grade: string, topic: string, board: BoardType, contentType: string, language: Language) => {
  if (currentProvider === 'deepseek') {
    return deepseek.generateTheoryContent(grade, topic, board, contentType, language);
  }
  return gemini.generateTheoryContent(grade, topic, board, contentType, language);
};

export const evaluateKheloIndiaScores = async (age: string, gender: string, tests: any[]) => {
  if (currentProvider === 'deepseek') {
    return deepseek.evaluateKheloIndiaScores(age, gender, tests);
  }
  return gemini.evaluateKheloIndiaScores(age, gender, tests);
};

export const explainBiomechanics = async (sport: string, concept: string, language: Language) => {
  if (currentProvider === 'deepseek') {
    return deepseek.explainBiomechanics(sport, concept, language);
  }
  return gemini.explainBiomechanics(sport, concept, language);
};

export const getSportsRule = async (sport: string, query: string, language: Language) => {
  if (currentProvider === 'deepseek') {
    return deepseek.getSportsRule(sport, query, language);
  }
  return gemini.getSportsRule(sport, query, language);
};

// Diagram generation is only supported by Gemini for now (using flash-image)
export const generateLessonDiagram = gemini.generateLessonDiagram;
export const generateSkillProgression = gemini.generateSkillProgression;
export const getStateRegulationInsights = gemini.getStateRegulationInsights;
export const generateAIToolContent = gemini.generateAIToolContent;
