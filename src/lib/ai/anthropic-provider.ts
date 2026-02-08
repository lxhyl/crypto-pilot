import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './system-prompt';
import { toAnthropicTools, toolNameToIntent } from './tools';
import type { ChatMessage, AIResponse, ToolCallResult } from '@/types';

export class AnthropicProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(
    messages: ChatMessage[],
    userAddress?: string,
    chainId?: number,
  ): Promise<AIResponse> {
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(userAddress, chainId),
      tools: toAnthropicTools(),
      messages: anthropicMessages,
    });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === 'text',
    );
    const toolBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    const toolCalls: ToolCallResult[] = toolBlocks.map((b) => ({
      intent: toolNameToIntent(b.name) as ToolCallResult['intent'],
      params: b.input as Record<string, unknown>,
    }));

    return {
      message: textBlocks.map((b) => b.text).join('\n'),
      toolCalls,
    };
  }
}
