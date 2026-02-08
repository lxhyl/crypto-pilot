import OpenAI from 'openai';
import { buildSystemPrompt } from './system-prompt';
import { toOpenAIFunctions, toolNameToIntent } from './tools';
import type { ChatMessage, AIResponse, ToolCallResult } from '@/types';

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(
    messages: ChatMessage[],
    userAddress?: string,
    chainId?: number,
  ): Promise<AIResponse> {
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt(userAddress, chainId) },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      tools: toOpenAIFunctions().map((fn) => ({
        type: 'function' as const,
        function: fn,
      })),
    });

    const choice = response.choices[0];
    const message = choice.message;
    const toolCalls: ToolCallResult[] = (message.tool_calls ?? [])
      .filter((tc): tc is OpenAI.Chat.ChatCompletionMessageToolCall & { type: 'function' } => tc.type === 'function')
      .map((tc) => ({
        intent: toolNameToIntent(tc.function.name) as ToolCallResult['intent'],
        params: JSON.parse(tc.function.arguments),
      }));

    return {
      message: message.content ?? '',
      toolCalls,
    };
  }
}
