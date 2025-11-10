export const runtime = 'edge';

interface RequestBody {
  text: string;
  voice?: string;
  speed?: number;
  sessionId?: string;
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

    const { text, voice = 'nova', speed = 0.9, sessionId } = body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        {
          status: 400,
          headers,
        }
      );
    }

    if (text.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Text too long (max 200 characters)' }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers,
        }
      );
    }

    // Clean text
    const cleanText = text.trim().replace(/[<>]/g, '') + '. ';

    // Create AbortController with 9 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      // Call OpenAI Text-to-Speech API
      const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          input: cleanText,
          voice: voice,
          speed: Math.max(0.25, Math.min(4.0, speed)),
          response_format: 'mp3'
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text().catch(() => 'Unknown error');
        console.error('OpenAI TTS Error:', openaiResponse.status, errorData);
        return new Response(
          JSON.stringify({ error: 'Speech generation failed' }),
          {
            status: 500,
            headers,
          }
        );
      }

      // Stream audio back to client
      const audioBuffer = await openaiResponse.arrayBuffer();

      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });

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

      console.error('TTS API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers,
        }
      );
    }

  } catch (error) {
    console.error('TTS API Handler Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers,
      }
    );
  }
}