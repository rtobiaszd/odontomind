
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// O SDK do AI Studio injeta a chave no process.env.API_KEY automaticamente
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const createAppointmentDeclaration: FunctionDeclaration = {
  name: 'createAppointment',
  parameters: {
    type: Type.OBJECT,
    description: 'Cria um agendamento odontológico no sistema.',
    properties: {
      patientName: { type: Type.STRING },
      dateTime: { type: Type.STRING, description: 'ISO format date time' },
      type: { type: Type.STRING, description: 'Consultation, Surgery, or Cleaning' }
    },
    required: ['patientName', 'dateTime', 'type'],
  },
};

export const processIncomingMessage = async (message: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é um gestor odontológico sênior. O sistema está aguardando ação para: "${message}"`,
      config: {
        tools: [{ functionDeclarations: [createAppointmentDeclaration] }],
      }
    });
    return response.functionCalls || [];
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      await window.aistudio.openSelectKey();
    }
    console.error("Gemini Execution Error:", error);
    return [];
  }
};

export const getAIAnalytics = async (data: any) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estes dados clínicos/financeiros e retorne insights estratégicos em JSON: ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            revenueForecast: { type: Type.STRING }
          },
          required: ["summary", "opportunities", "revenueForecast"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    return { summary: 'Analise estratégica indisponível no momento.' };
  }
};
