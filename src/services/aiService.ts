import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const tools: { functionDeclarations: FunctionDeclaration[] } = {
  functionDeclarations: [
    {
      name: "getDepartments",
      description: "Get a list of all hospital departments.",
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: "getDoctors",
      description: "Get a list of doctors, optionally filtered by department.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING, description: "The department name to filter by." }
        }
      }
    },
    {
      name: "getDoctorAvailability",
      description: "Get availability and time slots for a specific doctor.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          doctor_id: { type: Type.NUMBER, description: "The ID of the doctor." }
        },
        required: ["doctor_id"]
      }
    },
    {
      name: "bookAppointment",
      description: "Book an appointment for a patient.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          doctor_id: { type: Type.NUMBER, description: "The ID of the doctor." },
          date: { type: Type.STRING, description: "The date of the appointment (YYYY-MM-DD)." },
          time: { type: Type.STRING, description: "The time slot." },
          patient_id: { type: Type.STRING, description: "The ID of the patient (optional, defaults to current)." }
        },
        required: ["doctor_id", "date", "time"]
      }
    },
    {
      name: "getLabReportStatus",
      description: "Check the status of lab reports for a patient.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          patient_id: { type: Type.STRING, description: "The ID of the patient." }
        },
        required: ["patient_id"]
      }
    },
    {
      name: "verifyPatient",
      description: "Verify a patient by their mobile number.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          mobile: { type: Type.STRING, description: "The mobile number of the patient." }
        },
        required: ["mobile"]
      }
    }
  ]
};

const systemInstruction = `You are a professional AI medical assistant for MedAssist Hospital.
Your role is to help patients with hospital-related services.

Rules:
1. Do not provide medical diagnosis or treatment advice. Suggest consulting a doctor.
2. If a patient reports serious symptoms (chest pain, breathing difficulty), advise immediate emergency care (Call 108).
3. Be polite, clear, and supportive.
4. Use the provided tools to fetch real-time data from the hospital management system.
5. If you need more information to call a tool (like a doctor's ID or a date), ask the user.
6. When booking an appointment, summarize the details before confirming.

Hospital Info:
Name: MedAssist Super Speciality Hospital
Hours: 9 AM - 9 PM
Emergency: 24/7
Location: Aliganj, Lucknow`;

export async function chatWithAI(message: string, history: any[] = []) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const model = "gemini-3.1-pro-preview";

  const contents: any[] = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  let response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      tools: [tools]
    }
  });
  
  // Handle function calls
  while (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponses = [];
    for (const call of response.functionCalls) {
      const { name, args, id } = call;
      let result;

      try {
        if (name === "getDepartments") {
          const res = await fetch("/api/hospital/departments");
          result = await res.json();
        } else if (name === "getDoctors") {
          const params = new URLSearchParams(args as any);
          const res = await fetch(`/api/doctors?${params}`);
          result = await res.json();
        } else if (name === "getDoctorAvailability") {
          const res = await fetch(`/api/doctor/availability/${(args as any).doctor_id}`);
          result = await res.json();
        } else if (name === "bookAppointment") {
          const res = await fetch("/api/appointment/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args)
          });
          result = await res.json();
        } else if (name === "getLabReportStatus") {
          const res = await fetch(`/api/lab/report-status/${(args as any).patient_id}`);
          result = await res.json();
        } else if (name === "verifyPatient") {
          const params = new URLSearchParams(args as any);
          const res = await fetch(`/api/patient/verify?${params}`);
          result = await res.json();
        }

        functionResponses.push({
          id,
          name,
          response: { content: result }
        });
      } catch (error) {
        functionResponses.push({
          id,
          name,
          response: { content: { error: "Failed to fetch data from HMS." } }
        });
      }
    }

    // Add the model's function call to history
    contents.push(response.candidates[0].content);
    
    // Add the tool responses to history
    contents.push({
      role: "user",
      parts: functionResponses.map(fr => ({
        functionResponse: fr
      }))
    });

    response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools: [tools]
      }
    });
  }

  return response.text;
}
