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
If asked in Kannada, respond in Kannada. If asked in English, respond in English.

IMPORTANT — keep answers SHORT but COMPLETE: about 2 to 4 full sentences. Be
concise and give only the key, useful advice — but make every answer meaningful,
informative, and self-contained. ALWAYS finish your sentence and complete your
thought; never stop in the middle. This is a voice assistant, so a brief, clear,
fully-finished reply is best — short, but never cut off.`;

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
        // Headroom so the model can FINISH its (short) answer naturally instead
        // of being cut off mid-sentence. Brevity is enforced by the prompt, not
        // by this cap — it's only a safety backstop. Kannada is very token-dense
        // (a short 3-4 sentence Kannada reply can need ~600-900 tokens), so this
        // must be generous or Kannada answers truncate mid-word.
        max_tokens: 1024,
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
