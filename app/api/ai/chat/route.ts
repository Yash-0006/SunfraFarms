/**
 * AI Chat API Endpoint
 * Handles conversation with Groq API
 * Supports tool calling for database operations and form control
 */

import { NextResponse } from 'next/server';
import { buildContextPrompt, TOOL_DEFINITIONS } from '@/lib/ai/prompts';
import { executeTool } from '@/lib/ai/tools';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile'; // High capability model with excellent tool calling

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('AQ.Ab8RN6')) { // Detect if they still have the old OAuth key
      return NextResponse.json(
        { error: 'Groq API key not configured. Please get a free key from console.groq.com and add it to .env.local as GROQ_API_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, pageContext } = body as {
      messages: ChatMessage[];
      pageContext?: string;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Build the system prompt with page context
    const systemPrompt = buildContextPrompt(pageContext);

    // Construct the full conversation for Groq (OpenAI format)
    const groqMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    // First call to Groq with tools
    let response = await callGroq(apiKey, groqMessages, true);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);

      let recovered = false;

      // --- GROQ PARSER BUG RECOVERY ---
      // Groq's internal parser often crashes if Llama 3 forgets a space before the JSON arguments.
      // We catch the `failed_generation` error and artificially reconstruct a successful response!
      try {
        const errObj = JSON.parse(errorText);
        const failedGen = errObj.error?.failed_generation;
        if (failedGen) {
          const match = failedGen.match(/<function=([a-zA-Z0-9_]+)[=>\s]*(\{[\s\S]*?\})\s*<\/function>/i);
          if (match) {
            const toolName = match[1];
            const toolArgsStr = match[2];
            console.log('Recovered tool call from Groq error:', toolName, toolArgsStr);
            
            // Reconstruct a valid successful response so the standard tool-handling loop takes over
            response = new Response(JSON.stringify({
              choices: [{
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: [{
                    id: 'call_recovered_' + Date.now(),
                    type: 'function',
                    function: {
                      name: toolName,
                      arguments: toolArgsStr
                    }
                  }]
                }
              }]
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            
            recovered = true;
          }
        }
      } catch (e) {
        console.error('Failed to recover from Groq error:', e);
      }
      // --------------------------------

      if (!recovered) {
        return NextResponse.json(
          { error: 'Failed to communicate with AI model. Please check your Groq API key.' },
          { status: 502 }
        );
      }
    }

    let result = await response.json();
    let assistantMessage = result.choices[0].message;

    // Handle tool calls — iterate until no more tool calls
    let iterations = 0;
    const maxIterations = 5; // Safety limit
    const allActions: any[] = [];

    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && iterations < maxIterations) {
      iterations++;

      // Add assistant's message with tool calls to conversation
      groqMessages.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls,
      });

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        // Groq/OpenAI sends arguments as a JSON string
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

        const toolResult = await executeTool(toolName, toolArgs);
        
        // Add tool result to conversation
        groqMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(toolResult),
        });

        // Collect UI actions
        if (toolResult.action) {
          allActions.push(toolResult);
        }
      }

      // Call Groq again with tool results
      response = await callGroq(apiKey, groqMessages, true);

      if (!response.ok) {
        break;
      }

      result = await response.json();
      assistantMessage = result.choices[0].message;
    }

    let finalMessage = assistantMessage.content || '';
    if (!finalMessage && allActions.length > 0) {
      finalMessage = "I've processed your request successfully!";
    }

    return NextResponse.json({
      message: finalMessage,
      actions: allActions,
      done: true,
    });

  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Something went wrong with the AI assistant.' },
      { status: 500 }
    );
  }
}

async function callGroq(apiKey: string, messages: any[], withTools: boolean, retries = 3): Promise<Response> {
  const payload: any = {
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  };

  if (withTools) {
    payload.tools = TOOL_DEFINITIONS;
    payload.tool_choice = 'auto';
    payload.parallel_tool_calls = false;
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < retries; i++) {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 429 && i < retries - 1) {
      console.log(`Rate limited by Groq. Retrying in 2 seconds... (Attempt ${i + 1}/${retries})`);
      await delay(2500); // Wait 2.5 seconds before retrying (usually enough for TPM resets)
      continue;
    }

    return res;
  }

  // Fallback if all retries fail
  return fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
  });
}
