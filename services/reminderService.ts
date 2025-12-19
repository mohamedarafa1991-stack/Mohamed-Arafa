
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const reminderService = {
  async generateReminderMessage(patientName: string, doctorName: string, dateTime: string, type: 'SMS' | 'WhatsApp') {
    const prompt = `Draft a professional and friendly ${type} reminder for a medical appointment.
    Patient: ${patientName}
    Doctor: ${doctorName}
    Time: ${dateTime}
    Include a request to confirm by replying "YES" or cancel by replying "NO". Keep it concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  },

  async sendReminder(patientPhone: string, message: string) {
    console.log(`[Reminders] Sending to ${patientPhone}:`, message);
    // In a real app, this would call Twilio or WhatsApp Business API
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
