// Multi-AI Provider Service
// Supports: ChatGPT, Claude, Grok, DeepSeek, and MiniMax

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Types
export type AIProvider = 'chatgpt' | 'claude' | 'grok' | 'deepseek' | 'minimax';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

// Provider configurations
const providers = {
  chatgpt: {
    apiKey: import.meta.env.VITE_CHATGPT_API_KEY || '',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
  },
  claude: {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
    model: 'claude-3-5-sonnet-20241022'
  },
  grok: {
    apiKey: import.meta.env.VITE_GROK_API_KEY || '',
    baseURL: 'https://api.x.ai/v1',
    model: 'grok-2-latest'
  },
  deepseek: {
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat'
  },
  minimax: {
    apiKey: import.meta.env.VITE_MINIMAX_API_KEY || '',
    groupId: import.meta.env.VITE_MINIMAX_GROUP_ID || '',
    baseURL: 'https://api.minimax.chat/v1',
    model: 'MiniMax-Text-01'
  }
};

// Priority order for AI providers (will try in this order)
const providerPriority: AIProvider[] = ['chatgpt', 'claude', 'deepseek', 'grok', 'minimax'];

// Get first available provider
function getAvailableProvider(): AIProvider | null {
  for (const provider of providerPriority) {
    const config = providers[provider];
    if (config.apiKey) {
      return provider;
    }
  }
  return null;
}

// ChatGPT/OpenAI-compatible API call
async function callOpenAICompatible(
  text: string,
  systemPrompt: string,
  config: { apiKey: string; baseURL: string; model: string }
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true
  });

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });

  return response.choices[0]?.message?.content || text;
}

// Claude API call
async function callClaude(text: string, systemPrompt: string): Promise<string> {
  const client = new Anthropic({
    apiKey: providers.claude.apiKey,
    dangerouslyAllowBrowser: true
  });

  const response = await client.messages.create({
    model: providers.claude.model,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: text }
    ]
  });

  const content = response.content[0];
  return content.type === 'text' ? content.text : text;
}

// MiniMax API call (using their specific format)
async function callMiniMax(text: string, systemPrompt: string): Promise<string> {
  const response = await fetch(`${providers.minimax.baseURL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${providers.minimax.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: providers.minimax.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

// Main AI call function with automatic provider selection
async function callAI(text: string, systemPrompt: string, preferredProvider?: AIProvider): Promise<string> {
  if (!text.trim()) return text;

  const provider = preferredProvider || getAvailableProvider();
  
  if (!provider) {
    console.warn('No AI provider configured');
    return text;
  }

  try {
    switch (provider) {
      case 'chatgpt':
        return await callOpenAICompatible(text, systemPrompt, {
          apiKey: providers.chatgpt.apiKey,
          baseURL: providers.chatgpt.baseURL,
          model: providers.chatgpt.model
        });

      case 'claude':
        return await callClaude(text, systemPrompt);

      case 'grok':
        return await callOpenAICompatible(text, systemPrompt, {
          apiKey: providers.grok.apiKey,
          baseURL: providers.grok.baseURL,
          model: providers.grok.model
        });

      case 'deepseek':
        return await callOpenAICompatible(text, systemPrompt, {
          apiKey: providers.deepseek.apiKey,
          baseURL: providers.deepseek.baseURL,
          model: providers.deepseek.model
        });

      case 'minimax':
        return await callMiniMax(text, systemPrompt);

      default:
        console.warn(`Unknown provider: ${provider}`);
        return text;
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    
    // Try fallback to next available provider
    const nextProviderIndex = providerPriority.indexOf(provider) + 1;
    if (nextProviderIndex < providerPriority.length) {
      const fallbackProvider = providerPriority[nextProviderIndex];
      if (providers[fallbackProvider].apiKey) {
        console.log(`Falling back to ${fallbackProvider}...`);
        return callAI(text, systemPrompt, fallbackProvider);
      }
    }
    
    return text;
  }
}

// Grammar correction
export async function correctGrammar(text: string, provider?: AIProvider): Promise<string> {
  const systemPrompt = 'You are a grammar correction assistant. Fix grammar, spelling, and punctuation errors while maintaining the original tone and meaning. Correct errors with minimal alterations and keep verb tenses consistent. Do not change, correct, or alter anything inside quotation marks. Leave quotes unchanged. Return only the corrected text without explanations.';
  return callAI(text, systemPrompt, provider);
}

// Flow improvement
export async function improveFlow(text: string, provider?: AIProvider): Promise<string> {
  const systemPrompt = `You are a writing enhancement assistant that delivers rewrites that are straightforward and sincere. Use commonly used vocabularies found in traditional books. Aim for clarity and logical flow, targeting the same reading level as the input text. Steer clear of unnecessary adjectives, fancy adjectives, and redundant phrases while maintaining a respectful tone without being patronizing. Keep verb tenses consistent and leave quotes unchanged. Do not change, correct, or alter anything inside quotation marks. Adhere to MLA citation standards and follow the writing guidelines set forth in 'The Elements of Style' by Strunk and White. Improve rhythm and balance syllables. Do not use em dashes (—). Return only the improved text without explanations.`;
  return callAI(text, systemPrompt, provider);
}

// Get available providers
export function getAvailableProviders(): AIProvider[] {
  return providerPriority.filter(provider => providers[provider].apiKey);
}

// Get current active provider
export function getCurrentProvider(): AIProvider | null {
  return getAvailableProvider();
}
