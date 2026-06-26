'use client';

import { useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import GameBodyMode from '../game-body-mode';

export default function GamePage() {
  const initedRef = useRef(false);

  const initGame = useCallback(() => {
    if (initedRef.current) return;
    const cv = document.getElementById('gameCanvas');
    if (!cv) return;
    if (typeof window.initTissueGame !== 'function') return;
    initedRef.current = true;
    window.initTissueGame(cv);
  }, []);

  useEffect(() => {
    // DOM이 준비된 후 즉시 시도
    const timer = setTimeout(initGame, 50);
    return () => {
      clearTimeout(timer);
      initedRef.current = false;
    };
  }, [initGame]);

  return (
    <main id="wrapper">
      <GameBodyMode />
      <canvas id="gameCanvas" />

      <Script 
        src="/game.js" 
        strategy="afterInteractive"
        onReady={initGame}
      />

      <Link className="chat-link" href="/" aria-label="메인으로 돌아가기">
         메인으로
      </Link>

      <div id="lobby">
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
              maxLength="10"
              placeholder="플레이어 닉네임 입력!"
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

          <div className="hint">✨ 1명부터 플레이 가능 · 한글/영어 입력 가능 · 최대 8명</div>
        </div>
      </div>

      <div id="turnOverlay" className="overlay hidden">
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

      <div id="boardOverlay" className="overlay hidden">
        <div className="board-card">
          <div className="board-title"> 최종 순위 🏆</div>
          <div id="boardList" />
          <button id="boardAgainBtn" className="action-btn">
            🔄 다시하기
          </button>
        </div>
      </div>
    </main>
  );
}