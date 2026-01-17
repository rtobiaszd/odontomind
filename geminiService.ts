
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// Tenta obter a chave do ambiente de build ou do ambiente global
const API_KEY = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any)._ENV_?.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Function declarations for AI to interact with the system
const createAppointmentDeclaration: FunctionDeclaration = {
  name: 'createAppointment',
  parameters: {
    type: Type.OBJECT,
    description: 'Creates a dental appointment in the system.',
    properties: {
      patientName: { type: Type.STRING },
      dateTime: { type: Type.STRING, description: 'ISO format date time' },
      type: { type: Type.STRING, description: 'Consultation, Surgery, or Cleaning' }
    },
    required: ['patientName', 'dateTime', 'type'],
  },
};

const updateCRMStageDeclaration: FunctionDeclaration = {
  name: 'updateCRMStage',
  parameters: {
    type: Type.OBJECT,
    description: 'Moves a patient to a new stage in the pipeline.',
    properties: {
      patientId: { type: Type.STRING },
      newStage: { type: Type.STRING, description: 'Lead, Evaluation, Proposal, etc.' }
    },
    required: ['patientId', 'newStage'],
  },
};

export const processIncomingMessage = async (message: string) => {
  if (!API_KEY) {
    console.warn("Gemini API Key ausente. Verifique o ambiente.");
    return [];
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an expert dental manager. Act on this message: "${message}"`,
      config: {
        tools: [{ functionDeclarations: [createAppointmentDeclaration, updateCRMStageDeclaration] }],
      }
    });
    
    return response.functionCalls || [];
  } catch (error) {
    console.error("AI Automation Error:", error);
    return [];
  }
};

export const getAIAnalytics = async (data: any) => {
  if (!API_KEY) return { summary: 'Serviço de IA indisponível.' };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze data and return JSON insights: ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
            revenueForecast: { type: Type.STRING }
          },
          required: ["summary", "opportunities", "bottlenecks", "revenueForecast"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error("Analytics Error:", err);
    return { summary: 'Erro ao processar analytics.' };
  }
};
