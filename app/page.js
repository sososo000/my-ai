'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [missionProgress] = useState(12);
  const missionTarget = 20;

  return (
    <main className="home-page">
      {/* 방 배경 이미지 */}
      <img
        src="/assets/bg/otter-room.png"
        alt=""
        aria-hidden="true"
        className="home-bg-img"
      />

      {/* 설정 버튼 (좌측 하단) */}
      <button className="settings-btn" aria-label="설정">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span>설정</span>
      </button>

      {/* 중앙 콘텐츠 영역 */}
      <div className="home-center">
        {/* 타이틀 - 클라우드 스타일 */}
        <div className="title-cloud">
          <h1 className="title-main">휴지 <span className="title-exclaim">!</span></h1>
          <div className="title-sub-row">
            <span className="title-leaf"></span>
            <span className="title-sub">똥싸기 마스터 2인용</span>
            <span className="title-leaf">🌿</span>
          </div>
        </div>

        {/* 캐릭터 */}
        <div className="center-stage">
          <div className="center-shadow" />
          <div className="center-otter">
            <img
              src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png"
              alt="수달 캐릭터"
            />
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="center-buttons">
          <button
            className="btn-game-start"
            onClick={() => setShowModeSelect(!showModeSelect)}
          >
          </button>
          <button className="btn-item-box">아이템 모감</button>
        </div>

        {/* 게임 모드 선택 (토글) */}
        {showModeSelect && (
          <div className="mode-select-overlay" onClick={() => setShowModeSelect(false)}>
            <div className="mode-select-card" onClick={e => e.stopPropagation()}>
              <h3>게임 모드를 선택하세요!</h3>
              <div className="mode-select-list">
                <Link href="/game" className="mode-option mode-opt-game">
                  <img src="/assets/characters/tissue-otter/frames/cropped/02-nose-tickle-anticipation.png" alt="콧물" />
                  <div>
                    <strong>콧물 게임</strong>
                    <span>타이밍 리듬 액션!</span>
                  </div>
                </Link>
                <Link href="/chat" className="mode-option mode-opt-chat">
                  <img src="/assets/characters/tissue-otter/frames/cropped/08-relieved-sparkle-smile.png" alt="AI" />
                  <div>
                    <strong>AI 수달 친구</strong>
                    <span>퀴즈 풀어해!</span>
                  </div>
                </Link>
                <Link href="/poop-game.html" className="mode-option mode-opt-poop" target="_blank">
                  <img src="/assets/characters/tissue-otter/frames/cropped/10-combo-happy-bounce.png" alt="똥싸기" />
                  <div>
                    <strong>똥싸기 마스터</strong>
                    <span>2인용 로컬 배틀!</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 우측 패널: 오늘의 미션 + 게임 모드 */}
      <div className="home-right-panel">
        {/* 오늘의 미션 */}
        <div className="mission-card">
          <div className="mission-header">
            <span className="mission-star">✿</span>
            <span className="mission-title">오늘의 미션</span>
          </div>
          <div className="mission-body">
            <div className="mission-icon">🧻</div>
            <div className="mission-info">
              <span className="mission-desc">휴지 {missionTarget}칸 이동하기</span>
              <div className="mission-bar">
                <div
                  className="mission-bar-fill"
                  style={{ width: `${(missionProgress / missionTarget) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 게임 모드 */}
        <div className="game-mode-panel">
          <h2 className="game-mode-title">게임 모드</h2>
          <div className="game-mode-list">
            <Link href="/game" className="mode-item mode-item-game">
              <div className="mode-item-icon">
                <img
                  src="/assets/characters/tissue-otter/frames/cropped/02-nose-tickle-anticipation.png"
                  alt="물 게임"
                  className="mode-item-img"
                />
              </div>
              <div className="mode-item-info">
                <span className="mode-item-name">콧물 게임</span>
                <span className="mode-item-desc">타이밍 리듬 액션!</span>
              </div>
            </Link>

            <Link href="/chat" className="mode-item mode-item-chat">
              <div className="mode-item-icon">
                <img
                  src="/assets/characters/tissue-otter/frames/cropped/08-relieved-sparkle-smile.png"
                  alt="AI 수달"
                  className="mode-item-img"
                />
              </div>
              <div className="mode-item-info">
                <span className="mode-item-name">AI 수달 친구</span>
                <span className="mode-item-desc">퀴즈 풀어해!</span>
              </div>
            </Link>

            <Link href="/poop-game.html" className="mode-item mode-item-poop" target="_blank">
              <div className="mode-item-icon">
                <img
                  src="/assets/characters/tissue-otter/frames/cropped/24-game-over-pout.png"
                  alt="똥싸기 마스터"
                  className="mode-item-img"
                />
              </div>
              <div className="mode-item-info">
                <span className="mode-item-name">싸기 마스터</span>
                <span className="mode-item-desc">2인용 로컬 배틀!</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}