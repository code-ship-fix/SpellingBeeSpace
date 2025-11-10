export const runtime = 'edge';

interface RequestBody {
  prompt: string;
}

export default async function handler(request: Request) {
  // Set content type for all responses
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers,
        }
      );
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        {
          status: 400,
          headers,
        }
      );
    }

    const { prompt } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers,
        }
      );
    }

    if (prompt.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 200 characters)' }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Check for API key
    const apiKey = (process.env as any).OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers,
        }
      );
    }

    // Create AbortController with 9 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      // Call OpenAI Chat Completions API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides clear, concise responses for spelling practice. Keep responses brief and educational.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text().catch(() => 'Unknown error');
        console.error('OpenAI API Error:', openaiResponse.status, errorData);
        return new Response(
          JSON.stringify({ error: 'AI service unavailable' }),
          {
            status: 500,
            headers,
          }
        );
      }

      const data = await openaiResponse.json();
      const text = data.choices?.[0]?.message?.content || 'No response generated';

      return new Response(
        JSON.stringify({ text }),
        {
          status: 200,
          headers,
        }
      );

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timeout' }),
          {
            status: 504,
            headers,
          }
        );
      }

      console.error('Speak API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers,
        }
      );
    }

  } catch (error) {
    console.error('Speak API Handler Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers,
      }
    );
  }
}