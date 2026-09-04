/**
 * Direct Dify API Service - No backend proxy needed
 * Connects directly from browser to Dify API
 */

const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY || '';
const DIFY_API_URL = process.env.NEXT_PUBLIC_DIFY_API_URL || 'https://api.dify.ai/v1';

export interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DifyStreamChunk {
  event: string;
  answer?: string;
  content?: string;
  conversation_id?: string;
  message_id?: string;
  created_at?: number;
  task_id?: string;
}

/**
 * Send a message to Dify and get streaming response
 * Direct fetch from browser to Dify API
 */
export async function sendDifyMessage(
  message: string,
  userName: string,
  conversationId: string | null,
  onChunk: (chunk: string, isComplete: boolean) => void,
  onConversationId: (id: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const payload = {
      inputs: {
        user_name: userName || 'Friend',
      },
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId || '',
      user: userName || 'anonymous',
    };

    console.log('📤 Direct to Dify:', {
      message: message.substring(0, 50) + '...',
      userName: userName || 'Friend',
      conversationId: conversationId || 'new',
    });

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API error:', response.status, errorText);
      onError(`API error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';
    let conversationIdFromResponse: string | null = null;
    let isFirstChunk = true;

    while (true) {
      if (signal?.aborted) {
        console.log('🛑 Fetch aborted by user');
        reader.cancel();
        return;
      }

      const { done, value } = await reader.read();
      if (done) break;

      if (signal?.aborted) {
        console.log('🛑 Fetch aborted by user');
        reader.cancel();
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (signal?.aborted) {
          console.log('🛑 Fetch aborted by user');
          reader.cancel();
          return;
        }

        const trimmedLine = line.trim();
        if (trimmedLine === '') continue;

        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.substring(6).trim();

          if (data === '[DONE]') {
            const cleanResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            onChunk(cleanResponse, true);
            continue;
          }

          try {
            const parsed: DifyStreamChunk = JSON.parse(data);

            if (parsed.event === 'agent_message' || parsed.event === 'message') {
              const content = parsed.answer || parsed.content || '';
              if (content) {
                if (isFirstChunk) {
                  fullResponse = content;
                  isFirstChunk = false;
                } else {
                  if (content.length > fullResponse.length) {
                    fullResponse = content;
                  } else if (content.length < fullResponse.length) {
                    fullResponse += content;
                  }
                }
                onChunk(fullResponse, false);
              }
            }

            if (parsed.event === 'node_finished' && parsed.data?.outputs?.text) {
              const content = parsed.data.outputs.text;
              if (content) {
                fullResponse = content;
                onChunk(fullResponse, false);
              }
            }

            if (parsed.conversation_id) {
              conversationIdFromResponse = parsed.conversation_id;
            }
          } catch (e) {
            if (data && data.length > 0 && !data.startsWith('{')) {
              fullResponse = data;
              onChunk(fullResponse, false);
            }
          }
        }
      }
    }

    fullResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    if (!fullResponse) {
      onError('No response from AI');
      return;
    }

    if (conversationIdFromResponse) {
      onConversationId(conversationIdFromResponse);
    }

    onChunk(fullResponse, true);

  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.log('🛑 Request was aborted by user');
      return;
    }
    console.error('Direct Dify error:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Send a message to Dify and get non-streaming response
 */
export async function sendDifyMessageBlocking(
  message: string,
  userName: string,
  conversationId: string | null
): Promise<{ response: string; conversationId: string | null }> {
  try {
    const payload = {
      inputs: {
        user_name: userName || 'Friend',
      },
      query: message,
      response_mode: 'blocking',
      conversation_id: conversationId || '',
      user: userName || 'anonymous',
    };

    const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = (data.answer || data.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    return {
      response: fullResponse || 'No response from AI',
      conversationId: data.conversation_id || conversationId,
    };

  } catch (error) {
    console.error('Direct Dify blocking error:', error);
    throw error;
  }
}