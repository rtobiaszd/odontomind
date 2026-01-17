
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an expert dental manager. Act on this message: "${message}"`,
      config: {
        tools: [{ functionDeclarations: [createAppointmentDeclaration, updateCRMStageDeclaration] }],
      }
    });
    
    // Return function calls for the backend to execute
    return response.functionCalls || [];
  } catch (error) {
    console.error("AI Automation Error:", error);
    return [];
  }
};

export const getAIAnalytics = async (data: any) => {
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
};
