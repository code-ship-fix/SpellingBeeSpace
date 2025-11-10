export const runtime = 'edge';

interface RequestBody {
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

    const { sessionId } = body;

    // Generate or use provided session ID
    const newSessionId = sessionId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Note: In Edge Functions, we can't persist data to SQLite
    // This would need to be connected to a cloud database like Vercel KV, Supabase, etc.
    // For now, we'll just return a session ID for client-side tracking

    return new Response(
      JSON.stringify({
        sessionId: newSessionId,
        success: true,
        message: 'Session tracking initialized (client-side only)'
      }),
      {
        status: 200,
        headers,
      }
    );

  } catch (error) {
    console.error('Session tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to track session' }),
      {
        status: 500,
        headers,
      }
    );
  }
}