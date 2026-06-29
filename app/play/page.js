'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import GameBodyMode from '../game-body-mode';

export default function GamePage() {
  const [activeTab, setActiveTab] = useState('tissue');
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
    if (activeTab !== 'tissue') return;
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
  }, [activeTab]);

  return (
    <div id="wrapper">
      <GameBodyMode />

      {/* 휴지 슛! 게임 */}
      {activeTab === 'tissue' && (
        <>
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
            href="/game"
            aria-label="게임 홈으로 돌아가기"
            style={{ position: 'fixed', zIndex: 100 }}
          >
            🏠 게임 홈
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
                <span className="lobby-emoji"></span>
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
              <div className="board-title"> 최종 순위 🏆</div>
              <div id="boardList" />
              <div id="adContinueRow" className="action-row" style={{ display: 'none', gap: '12px', marginTop: '18px', justifyContent: 'center' }}>
                <button id="adWatchBtn" className="action-btn" style={{ background: 'linear-gradient(180deg, #FFD54F, #FFB300)', padding: '14px 28px' }}>
                  📺 광고보고 계속하기
                </button>
                <button id="boardAgainBtn" className="action-btn" style={{ padding: '14px 20px' }}>
                  🔄 다시하기
                </button>
              </div>
            </div>
          </div>

          {/* 광고 오버레이 (YouTube) */}
          <div id="adOverlay" className="overlay hidden" style={{ zIndex: 30, background: 'rgba(0,0,0,.92)', padding: 0 }}>
            <div id="adBox" style={{
              width: 'min(90vw, 640px)',
              aspectRatio: '16/9',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div id="adVideoWrap" style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <iframe id="adVideoIframe" style={{ width: '100%', height: '100%', border: 0 }}
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0"
                  allow="autoplay; fullscreen" allowFullScreen />
              </div>
              <button id="adCloseBtn" className="action-btn" style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                background: 'linear-gradient(180deg, #7BFFCB, #2fd38f)',
                padding: '10px 22px',
                display: 'none',
                fontSize: '16px'
              }}>
                ✕ 종료하고 이어서 하기
              </button>
              <div id="adTimer" style={{
                position: 'absolute',
                top: '-50px',
                left: '0',
                color: 'rgba(255,255,255,.7)',
                fontSize: '14px',
                fontWeight: 700
              }}>
                광고 시청 중...
              </div>
            </div>
          </div>
        </>
      )}

      {/* 똥싸기 마스터 게임 */}
      {activeTab === 'poop' && (
        <iframe
          src="/poop-game.html"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            border: 'none',
            zIndex: 0
          }}
          title="싸기 마스터"
        />
      )}
    </div>
  );
}
