'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

const initialMessages = [
  {
    sender: 'bot',
    text: '안녕! 나는 휴지 수달이야! 🦦💦\n물도 쓱쓱, 궁금한 것도 쓱쓱!\n뭐든지 물어봐~ 같이 놀자! 🧻✨'
  }
];

export default function ChatClient() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const sessionId = useMemo(
    () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    []
  );
  const listRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  const addMessage = (message) => {
    setMessages((current) => [...current, message]);
    scrollToBottom();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isWaiting) return;

    addMessage({ sender: 'user', text: message });
    setInput('');
    setIsWaiting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        addMessage({ sender: 'bot', text: data.error || '앗.. 문제가 생겼어. 다시 시도해볼까? 😢' });
        return;
      }

      addMessage({ sender: 'bot', text: data.reply });
    } catch {
      addMessage({ sender: 'bot', text: '네트워크 연결에 문제가 생겼어. 다시 시도해볼까? 😢' });
    } finally {
      setIsWaiting(false);
    }
  };

  const resetChat = async () => {
    if (isWaiting) return;
    await fetch('/api/chat/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    }).catch(() => {});
    setMessages(initialMessages);
  };

  return (
    <main className="chat-page">
      <section className="chat-app" aria-label="아이 AI 친구 채팅">
        <header className="chat-header">
          <div className="header-otter">
            <img src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png" alt="휴지 수달" className="header-otter-img" />
          </div>
          <div className="chat-actions">
            <Link className="nav-pill back-pill" href="/">
              <span className="pill-icon" aria-hidden="true">🎮</span>
              <span className="pill-label">게임으로 돌아가기</span>
            </Link>
            <button className="nav-pill reset-pill" type="button" onClick={resetChat} title="새 대화">
              <span className="pill-icon" aria-hidden="true">🔄</span>
              <span className="pill-label">새 대화</span>
            </button>
          </div>
        </header>

        <div className="chat-messages" ref={listRef}>
          {messages.map((message, index) => (
            <div className={`message ${message.sender}-message`} key={`${message.sender}-${index}`}>
              <div className={`avatar ${message.sender}-avatar`}>
                {message.sender === 'bot' ? (
                  <img src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png" alt="수달 친구" className="avatar-img" />
                ) : (
                  '👶'
                )}
              </div>
              <div className="bubble">{message.text}</div>
            </div>
          ))}

          {isWaiting && (
            <div className="message bot-message">
              <div className="avatar bot-avatar">
                <img src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png" alt="수달 친구" className="avatar-img" />
              </div>
              <div className="bubble">
                <div className="typing-indicator" aria-label="응답 작성 중">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="input-area">
          <form className="chat-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="message-input"
              placeholder="친구에게 말을 걸어봐~! 😊"
              autoComplete="off"
              value={input}
              disabled={isWaiting}
              onChange={(event) => setInput(event.target.value)}
            />
            <button type="submit" className="send-btn" disabled={isWaiting || !input.trim()} aria-label="보내기">
              ➤
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
