import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/provider-factory';
import { generateCalldata } from '@/lib/blockchain/calldata';
import type { ChatMessage, PreparedTransaction, IntentType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userAddress, chainId } = body as {
      messages: ChatMessage[];
      userAddress?: string;
      chainId?: number;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 },
      );
    }

    const provider = createAIProvider();
    const aiResponse = await provider.chat(messages, userAddress, chainId);

    let transaction: PreparedTransaction | null = null;

    // If AI called a tool, generate calldata
    if (aiResponse.toolCalls.length > 0 && userAddress && chainId) {
      const toolCall = aiResponse.toolCalls[0]; // one at a time
      try {
        transaction = generateCalldata(
          toolCall.intent as IntentType,
          toolCall.params,
          chainId,
          userAddress as `0x${string}`,
        );
      } catch (error) {
        return NextResponse.json({
          message: aiResponse.message || `I understood your request, but hit an error generating the transaction: ${(error as Error).message}`,
          transaction: null,
          toolCalls: aiResponse.toolCalls,
        });
      }
    } else if (aiResponse.toolCalls.length > 0 && !userAddress) {
      return NextResponse.json({
        message: aiResponse.message || 'Please connect your wallet first so I can prepare the transaction.',
        transaction: null,
        toolCalls: aiResponse.toolCalls,
      });
    }

    return NextResponse.json({
      message: aiResponse.message,
      transaction,
      toolCalls: aiResponse.toolCalls,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        message: `Sorry, I encountered an error: ${(error as Error).message}`,
        transaction: null,
        toolCalls: [],
      },
      { status: 500 },
    );
  }
}
