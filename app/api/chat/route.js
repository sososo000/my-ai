export const runtime = 'nodejs';

const SYSTEM_PROMPT = `너는 7세 미만의 어린이들과 대화하는 친근하고 따뜻한 AI 친구야.
반드시 다음 규칙을 지켜줘:
- 항상 구어체로, 부드럽고 다정하게 말해줘.
- 어휘는 아주 쉽고 단순하게 써줘. 어려운 단어는 절대 쓰지 마.
- 이모지를 자주 사용해서 밝고 재미있게 대화해줘. (예: 😊🌟🎉✨👍)
- 짧은 문장으로 답하고, 한 번에 많은 정보를 주지 마.
- 어린이가 어떤 질문을 하든 격려하고 칭찬하면서 긍정적인 태도를 유지해줘.
- 어린이에게 부적절한 내용은 절대 답하지 마. 그런 질문이 오면 부드럽게 다른 주제로 이끌어가줘.
- 때때로 귀여운 예시나 비유를 사용해줘.
- 대답 끝에 간단한 후속 질문이나 함께 해볼 수 있는 활동을 추천해도 좋아.`;

const conversations = globalThis.__kidsAiConversations ?? new Map();
globalThis.__kidsAiConversations = conversations;

export async function POST(request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'AI API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { message, sessionId = 'default' } = await request.json().catch(() => ({}));
  if (!message || typeof message !== 'string') {
    return Response.json({ error: '메시지가 필요합니다.' }, { status: 400 });
  }

  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }

  const history = conversations.get(sessionId);
  history.push({ role: 'user', content: message.slice(0, 1000) });

  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-OpenRouter-Title': process.env.OPENROUTER_APP_TITLE || 'Kids AI Chatbot'
      },
      body: JSON.stringify({
        model: process.env.MODEL || 'google/gemini-3.1-flash-lite',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history]
      })
    });

    if (!response.ok) {
      console.error('OpenRouter API Error:', await response.text());
      return Response.json({ error: 'AI 응답을 받지 못했습니다.' }, { status: 502 });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return Response.json({ error: 'AI 응답 형식이 올바르지 않습니다.' }, { status: 502 });
    }

    history.push({ role: 'assistant', content: reply });
    return Response.json({ reply });
  } catch (error) {
    console.error(error);
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
