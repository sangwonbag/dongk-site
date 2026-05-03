import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!process.env.OPENAI_API_KEY) {
     return res.status(500).json({ error: 'Missing OPENAI_API_KEY environment variable' });
  }

  const { messages } = req.body;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return res.status(200).json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
