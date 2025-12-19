
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const medicalAiService = {
  /**
   * Predicts potential scheduling conflicts or optimization opportunities.
   */
  async analyzeAppointmentConflict(newAppt: any, existingAppts: any[]) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze if this appointment: ${JSON.stringify(newAppt)} conflicts with these: ${JSON.stringify(existingAppts)}. 
      Consider doctor availability, specialized room requirements, and average procedure duration. 
      Return a concise clinical warning or "NO_CONFLICT".`,
    });
    return response.text;
  },

  /**
   * Suggests diagnosis and treatment codes based on clinical notes.
   */
  async suggestDiagnosis(notes: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Act as a senior medical consultant. Based on these clinical notes, suggest likely ICD-10 diagnosis codes and evidence-based treatment templates: "${notes}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedDiagnoses: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['code', 'description']
              }
            },
            treatmentPlan: { type: Type.STRING },
            clinicalAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskLevel: { type: Type.STRING, description: 'Low, Medium, or High' }
          },
          required: ['suggestedDiagnoses', 'treatmentPlan', 'riskLevel']
        }
      }
    });
    return JSON.parse(response.text);
  },

  /**
   * Transcribes and structures voice notes into professional clinical documentation.
   */
  async processVoiceNote(audioBase64: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: 'audio/mp3',
            data: audioBase64
          }
        },
        {
          text: "Transcribe this medical dictation and format it as a professional SOAP note (Subjective, Objective, Assessment, Plan)."
        }
      ]
    });
    return response.text;
  },

  /**
   * Summarizes patient history for quick doctor briefing.
   */
  async summarizePatientHistory(history: string[]) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a high-yield executive summary for a busy physician. Focus on chronic conditions, recent interventions, and drug allergies: ${history.join(', ')}`,
    });
    return response.text;
  }
};
