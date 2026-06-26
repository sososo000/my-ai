export const runtime = 'nodejs';

export async function POST(request) {
  const { sessionId = 'default' } = await request.json().catch(() => ({}));
  globalThis.__kidsAiConversations?.delete(sessionId);

  return Response.json({ success: true });
}
