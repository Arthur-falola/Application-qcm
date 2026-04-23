import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, Subject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMCQs(subject: Subject, count: number = 5): Promise<MCQ[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Génère ${count} questions à choix multiples (QCM) de haut niveau pour des étudiants en médecine sur le sujet : ${subject}. 
    Les questions doivent être en français, précises et pédagogiques.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Fournis exactement 4 options."
            },
            correctAnswerIndex: { 
              type: Type.INTEGER,
              description: "L'index de la bonne réponse (0-3)."
            },
            explanation: { type: Type.STRING },
            subject: { type: Type.STRING }
          },
          required: ["id", "question", "options", "correctAnswerIndex", "explanation", "subject"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text);
}

export async function askQuestionAboutMCQ(mcq: MCQ, userQuestion: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tu es un assistant médical pédagogique. Un étudiant a une question sur ce QCM :
    Question : ${mcq.question}
    Correct : ${mcq.options[mcq.correctAnswerIndex]}
    Explication : ${mcq.explanation}
    
    Question de l'étudiant : ${userQuestion}
    
    Réponds de manière concise et claire pour aider l'étudiant à comprendre.`,
  });

  return response.text || "Désolé, je n'ai pas pu générer d'explication supplémentaire.";
}
