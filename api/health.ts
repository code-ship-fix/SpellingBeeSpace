export const runtime = 'edge';

export default async function handler(request: Request) {
  try {
    return new Response(
      JSON.stringify({ ok: true, timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Health check failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}