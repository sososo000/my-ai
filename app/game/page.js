'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import GameBodyMode from '../game-body-mode';

export default function GamePage() {
  const initedRef = useRef(false);
  const retryRef = useRef(null);

  const tryInit = () => {
    if (initedRef.current) return true;
    const cv = document.getElementById('gameCanvas');
    if (!cv) return false;
    if (typeof window.initTissueGame !== 'function') return false;
    initedRef.current = true;
    window.initTissueGame(cv);
    return true;
  };

  useEffect(() => {
    if (tryInit()) return;
    let attempts = 0;
    retryRef.current = setInterval(() => {
      attempts++;
      if (tryInit() || attempts >= 30) {
        clearInterval(retryRef.current);
      }
    }, 100);

    return () => {
      clearInterval(retryRef.current);
      initedRef.current = false;
    };
  }, []);

  return (
    <div id="wrapper">
      <GameBodyMode />

      <canvas
        id="gameCanvas"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}
      />

      <Script
        src="/game.js"
        strategy="afterInteractive"
        onReady={tryInit}
      />

      <Link
        className="chat-link"
        href="/"
        aria-label="메인으로 돌아가기"
        style={{ position: 'fixed', zIndex: 100 }}
      >
        🏠 메인으로
      </Link>

      <div
        id="lobby"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="lobby-box">
          <div className="lobby-header">
            <span className="lobby-emoji">🧻</span>
            <div className="lobby-title">휴지 슛!</div>
            <span className="lobby-emoji">💦</span>
          </div>
          <div className="lobby-subtitle">꼬깔콘 휴지로 콧물을 ! · 타이밍 리듬 액션</div>

          <div className="player-list" id="playerList">
            <div className="empty-hint">
              👇 아래에 이름을 입력하고 <b>+</b> 버튼을 눌러보세요
            </div>
          </div>

          <div className="input-row">
            <input
              id="nameInput"
              type="text"
              maxLength={10}
              placeholder="플레이어 네임 입력!"
              inputMode="text"
              autoComplete="off"
            />
            <button id="addBtn" title="add">+</button>
          </div>

          <div className="start-row">
            <button id="clearBtn">초기화</button>
            <button id="startBtn" disabled>
              🎮게임 시작
            </button>
          </div>

          <div className="hint">✨ 1명부터 플레이 가능 · 8명</div>
        </div>
      </div>

      <div id="turnOverlay" className="overlay hidden" style={{ zIndex: 20 }}>
        <div className="turn-card">
          <div id="turnPrevName" className="turn-prev-name" />
          <div id="turnPrevScore" className="turn-prev-score" />
          <div id="turnPrevCo" className="turn-prev-combo" />
          <div className="turn-next-label">다음 플레이어</div>
          <div id="turnNextName" className="turn-next-name" />
          <button id="turnNextBtn" className="action-btn">
            👆 시작!
          </button>
          <div id="turnOrder" className="turn-order" />
        </div>
      </div>

      <div id="boardOverlay" className="overlay hidden" style={{ zIndex: 20 }}>
        <div className="board-card">
          <div className="board-title">🏆 최종 순위 🏆</div>
          <div id="boardList" />
          <button id="boardAgainBtn" className="action-btn">
             다시하기
          </button>
        </div>
      </div>
    </div>
  );
}