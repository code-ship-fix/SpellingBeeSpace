export const runtime = 'edge';

interface RequestBody {
  sessionId: string;
  action: string;
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

    const { sessionId, action } = body;

    // Validate input
    if (!sessionId || !action) {
      return new Response(
        JSON.stringify({ error: 'Session ID and action are required' }),
        {
          status: 400,
          headers,
        }
      );
    }

    if (!['practiced', 'ai_speech', 'classic_speech'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Note: In Edge Functions, we can't persist data to SQLite
    // This would need to be connected to a cloud database like Vercel KV, Supabase, etc.
    // For now, we'll just acknowledge the tracking request

    console.log(`Tracking: Session ${sessionId} performed action: ${action}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Action tracked (logged only)'
      }),
      {
        status: 200,
        headers,
      }
    );

  } catch (error) {
    console.error('Word tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to track word action' }),
      {
        status: 500,
        headers,
      }
    );
  }
}