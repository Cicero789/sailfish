// OpenAI service for grammar correction and flow improvement
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

export async function correctGrammar(text: string): Promise<string> {
  if (!text.trim()) return text;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a grammar correction assistant. Fix grammar, spelling, and punctuation errors while maintaining the original tone and meaning. Return only the corrected text without explanations.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Grammar correction error:', error);
    return text;
  }
}

export async function improveFlow(text: string): Promise<string> {
  if (!text.trim()) return text;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a writing improvement assistant. Enhance the text for better flow, rhythm, and syllable balance. Improve readability and eloquence while preserving the core message. Return only the improved text without explanations.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Flow improvement error:', error);
    return text;
  }
}
