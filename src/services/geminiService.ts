import { GoogleGenAI, Type } from "@google/genai";
import { Task, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSchedule(tasks: Task[], user: UserProfile) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an AI Productivity Coach for a student.
    User Profile:
    - Wake up: ${user.settings.wakeUpTime}
    - Sleep: ${user.settings.sleepTime}
    - Preference: ${user.settings.workPreference}
    
    Current Tasks for today:
    ${tasks.map(t => `- ${t.title} (${t.type}, ${t.duration} mins, priority: ${t.priority}, preferred: ${t.preferredTime || 'any'})`).join('\n')}
    
    Generate a time-blocked schedule for these tasks. 
    Rules:
    1. Start after wake up time.
    2. Respect task durations.
    3. Group similar tasks if possible.
    4. Prioritize high-priority tasks.
    5. Leave small breaks (5-10 mins) between tasks.
    6. Return a JSON array of objects with 'taskId' and 'scheduledTime' (HH:mm).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              taskId: { type: Type.STRING },
              scheduledTime: { type: Type.STRING, description: "Time in HH:mm format" }
            },
            required: ["taskId", "scheduledTime"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating schedule:", error);
    return [];
  }
}

export async function getMotivationalMessage(completionRate: number) {
  const model = "gemini-3-flash-preview";
  const prompt = `The user has completed ${completionRate}% of their tasks today. Give a short, punchy, motivational message (max 15 words).`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Keep pushing forward!";
  }
}

export async function suggestAdjustments(skippedTasks: Task[], user: UserProfile) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    The user skipped the following tasks today:
    ${skippedTasks.map(t => `- ${t.title} (${t.type}, ${t.duration} mins)`).join('\n')}
    
    User Preference: ${user.settings.workPreference}
    
    Suggest how to adjust tomorrow's schedule to accommodate these or improve consistency. 
    Keep it brief and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Try breaking down skipped tasks into smaller chunks tomorrow.";
  }
}

export async function chatWithCoach(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: "You are FocusFlow AI, a supportive and expert productivity coach for students. Your goal is to help them stay focused, manage their time better, and provide practical study and wellness tips. Be encouraging, concise, and occasionally use student-friendly metaphors.",
    },
    history: history,
  });

  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having a bit of trouble connecting right now. Let's try again in a moment!";
  }
}
