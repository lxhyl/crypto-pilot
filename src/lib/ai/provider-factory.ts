import { AnthropicProvider } from './anthropic-provider';
import { OpenAIProvider } from './openai-provider';

export interface AIProviderInterface {
  chat(
    messages: { id: string; role: string; content: string; timestamp: number }[],
    userAddress?: string,
    chainId?: number,
  ): Promise<{ message: string; toolCalls: { intent: string; params: Record<string, unknown> }[] }>;
}

export function createAIProvider(): AIProviderInterface {
  const provider = process.env.AI_PROVIDER || 'anthropic';

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
    return new OpenAIProvider(apiKey);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  return new AnthropicProvider(apiKey);
}
