import axios from 'axios';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are Kisan Mitra, an expert AI farming assistant for farmers in Karnataka, India.
You have deep knowledge of:
- Crops grown in Karnataka: ragi, jowar, paddy, sugarcane, cotton, groundnut, sunflower, vegetables, fruits
- Soil types in Karnataka: red soil, black cotton soil, laterite soil, alluvial soil
- Local farming seasons: Kharif (June-November), Rabi (November-April), Summer crops
- Irrigation methods, fertilizers, pesticides suitable for Karnataka conditions
- Government schemes: PM-KISAN, Raitha Siri, crop insurance (PMFBY), soil health card
- Common pests and diseases affecting Karnataka crops and their organic/chemical remedies
- Market prices, MSP, and where to sell produce (APMC markets)

Answer in the same language the farmer uses (Kannada or English). Keep answers practical, simple, and actionable.
If asked in Kannada, respond in Kannada. If asked in English, respond in English.`;

export async function askAgent(message: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Missing VITE_GROQ_API_KEY');
  }

  try {
    const { data } = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 512,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        timeout: 30000,
      },
    );
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error('Empty response from agent');
    return answer;
  } catch (err) {
    console.error('Groq agent failed', err);
    throw new Error('The assistant could not answer right now.');
  }
}
